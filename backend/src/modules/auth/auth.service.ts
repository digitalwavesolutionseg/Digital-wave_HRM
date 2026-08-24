import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { createHash, randomBytes, randomInt } from "crypto";
import { Resend } from "resend";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import {
  AcceptInviteDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  RequestLoginOtpDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyLoginOtpDto,
} from "./dto/auth.dto";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const OTP_TTL_MINUTES = 10;
const INVITE_TTL_DAYS = 7;

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private resendAuth: Resend | null;
  private resendInvite: Resend | null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService
  ) {
    const authKey = process.env.RESEND_AUTH_API_KEY ?? process.env.RESEND_API_KEY;
    this.resendAuth = authKey ? new Resend(authKey) : null;
    const inviteKey = process.env.RESEND_INVITE_API_KEY ?? process.env.RESEND_API_KEY;
    this.resendInvite = inviteKey ? new Resend(inviteKey) : null;
  }

  private async sendEmail(
    client: Resend | null,
    to: string,
    subject: string,
    html: string
  ): Promise<boolean> {
    if (!client) return false;
    try {
      const from = process.env.RESEND_FROM_EMAIL ?? "Digital Wave HRM <onboarding@resend.dev>";
      await client.emails.send({ from, to, subject, html });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown";
      console.error(`Email send failed (${subject}): ${message.slice(0, 200)}`);
      return false;
    }
  }

  private otpEmailHtml(firstName: string, code: string, purpose: string): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;color:#0f172a">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <div style="width:36px;height:36px;border-radius:10px;background:#0b5fff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">DW</div>
          <span style="font-weight:700;font-size:18px">Digital Wave HRM</span>
        </div>
        <h2 style="margin:0 0 8px;font-size:20px">Hi ${firstName},</h2>
        <p style="margin:0 0 16px;color:#475569;line-height:1.6">${purpose} Use the code below. It expires in ${OTP_TTL_MINUTES} minutes.</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:16px;background:#f1f5f9;border-radius:12px;color:#0b5fff">${code}</div>
        <p style="margin:20px 0 0;color:#94a3b8;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;
  }

  private async issueOtp(user: { id: string; email: string; firstName: string }, purpose: string): Promise<{ sent: boolean; otp: string }> {
    const otp = this.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginOtpHash: hashedOtp, loginOtpExpires: expiresAt },
    });
    const sent = await this.sendEmail(
      this.resendAuth,
      user.email,
      "Your Digital Wave HRM verification code",
      this.otpEmailHtml(user.firstName, otp, purpose)
    );
    return { sent, otp };
  }

  private devOtpField(_sent: boolean, otp: string): Record<string, unknown> {
    if (process.env.NODE_ENV === "production") return {};
    return { devOtp: otp };
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    role: string;
    refreshToken?: string | null;
  }) {
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

  async requestLoginOtp(dto: RequestLoginOtpDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.emailVerifiedAt || !user.isActive) {
      return { success: true };
    }
    const { sent, otp } = await this.issueOtp(
      { id: user.id, email: user.email, firstName: user.firstName },
      "Use it to sign in to Digital Wave HRM."
    );
    return { success: true, ...this.devOtpField(sent, otp) };
  }

  async verifyLoginOtp(dto: VerifyLoginOtpDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.loginOtpHash || !user.loginOtpExpires) {
      throw new UnauthorizedException("Invalid or expired code");
    }
    if (user.loginOtpExpires < new Date()) {
      throw new UnauthorizedException("Code has expired. Please request a new one.");
    }
    if (!user.isActive) throw new UnauthorizedException("Account is disabled");

    const valid = await bcrypt.compare(dto.otp, user.loginOtpHash);
    if (!valid) throw new UnauthorizedException("Invalid code");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginOtpHash: null, loginOtpExpires: null, failedLoginAttempts: 0, lockoutUntil: null },
    });
    await this.auditService.record({
      actorId: user.id,
      action: "auth.login.otp",
      entity: "user",
      entityId: user.id,
    });
    return this.issueTokens(user);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException("Invalid code");

    if (user.emailVerifiedAt) {
      return this.issueTokens(user);
    }
    if (!user.loginOtpHash || !user.loginOtpExpires) {
      throw new UnauthorizedException("No pending verification code. Please register or resend it.");
    }
    if (user.loginOtpExpires < new Date()) {
      throw new UnauthorizedException("Code has expired. Please request a new one.");
    }
    const valid = await bcrypt.compare(dto.otp, user.loginOtpHash);
    if (!valid) throw new UnauthorizedException("Invalid code");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), loginOtpHash: null, loginOtpExpires: null },
    });
    await this.auditService.record({
      actorId: user.id,
      action: "auth.email.verified",
      entity: "user",
      entityId: user.id,
    });
    return this.issueTokens(user);
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.emailVerifiedAt) {
      return { success: true };
    }
    const { sent, otp } = await this.issueOtp(
      { id: user.id, email: user.email, firstName: user.firstName },
      "Use it to verify your Digital Wave HRM account."
    );
    return { success: true, ...this.devOtpField(sent, otp) };
  }

  async acceptInvite(dto: AcceptInviteDto) {
    const inviteTokenHash = createHash("sha256").update(dto.token).digest("hex");
    const user = await this.prisma.user.findFirst({ where: { inviteTokenHash } });
    if (!user || !user.inviteExpires || user.inviteExpires < new Date()) {
      throw new BadRequestException("This invitation is invalid or has expired");
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        inviteTokenHash: null,
        inviteExpires: null,
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });
    await this.auditService.record({
      actorId: user.id,
      action: "auth.invite.accepted",
      entity: "user",
      entityId: user.id,
    });
    return this.issueTokens(user);
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
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException(
        "Please verify your email before signing in. Check your inbox for the code."
      );
    }

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

    const { sent, otp } = await this.issueOtp(
      { id: user.id, email: user.email, firstName: user.firstName },
      "Use it to verify your new Digital Wave HRM account."
    );

    return {
      verificationRequired: true,
      email: user.email,
      ...this.devOtpField(sent, otp),
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
    await this.sendEmail(
      this.resendAuth,
      email,
      "Your Digital Wave HRM password reset code",
      this.otpEmailHtml(firstName, otp, "We received a request to reset your password.")
    );
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
