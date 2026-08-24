import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { Resend } from "resend";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from "./dto/auth.dto";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private resend: Resend | null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService
  ) {
    this.resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new UnauthorizedException(
        "Account temporarily locked after repeated failed attempts. Try again later."
      );
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const data: { failedLoginAttempts: number; lockoutUntil?: Date } = {
        failedLoginAttempts: attempts,
      };
      if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        data.lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }
      await this.prisma.user.update({ where: { id: user.id }, data });
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) throw new UnauthorizedException("Account is disabled");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockoutUntil: null },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitize(user),
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException("Current password is incorrect");

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: passwordHash,
        passwordChangedAt: new Date(),
        refreshToken: null,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

    await this.auditService.record({
      actorId: userId,
      action: "auth.password.change",
      entity: "user",
      entityId: userId,
    });

    return { success: true };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: "EMPLOYEE",
        passwordChangedAt: new Date(),
      },
    });

    await this.auditService.record({
      actorId: user.id,
      action: "auth.register",
      entity: "user",
      entityId: user.id,
    });
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitize(user),
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.refreshToken !== dto.refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }
      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.sanitize(user),
      };
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.sanitize(user);
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      return { success: true };
    }

    const otp = this.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetOtp: hashedOtp, passwordResetOtpExpires: expiresAt },
    });

    await this.sendOtpEmail(user.email, user.firstName, otp);

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpires) {
      throw new BadRequestException("No password reset request found for this email");
    }

    if (user.passwordResetOtpExpires < new Date()) {
      throw new BadRequestException("OTP has expired. Please request a new one.");
    }

    const valid = await bcrypt.compare(dto.otp, user.passwordResetOtp);
    if (!valid) {
      throw new BadRequestException("Invalid OTP");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        passwordChangedAt: new Date(),
        passwordResetOtp: null,
        passwordResetOtpExpires: null,
        refreshToken: null,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

    await this.auditService.record({
      actorId: user.id,
      action: "auth.password.reset",
      entity: "user",
      entityId: user.id,
    });

    return { success: true };
  }

  private generateOtp(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
  }

  private async sendOtpEmail(email: string, firstName: string, otp: string) {
    if (!this.resend) return;
    const from = process.env.RESEND_FROM_EMAIL ?? "Digital Wave HRM <onboarding@resend.dev>";
    await this.resend.emails.send({
      from,
      to: email,
      subject: "Your Digital Wave HRM password reset code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;color:#0f172a">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <div style="width:36px;height:36px;border-radius:10px;background:#0b5fff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">DW</div>
            <span style="font-weight:700;font-size:18px">Digital Wave HRM</span>
          </div>
          <h2 style="margin:0 0 8px;font-size:20px">Hi ${firstName},</h2>
          <p style="margin:0 0 16px;color:#475569;line-height:1.6">We received a request to reset your password. Use the code below to complete the reset. It expires in 10 minutes.</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:16px;background:#f1f5f9;border-radius:12px;color:#0b5fff">${otp}</div>
          <p style="margin:20px 0 0;color:#94a3b8;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: "15m",
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  }

  private sanitize(user: any) {
    const { password, refreshToken, ...rest } = user;
    return rest;
  }
}
