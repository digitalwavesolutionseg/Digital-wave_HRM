import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto, RefreshTokenDto, RegisterDto } from "./dto/auth.dto";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    if (!user.isActive) throw new UnauthorizedException("Account is disabled");

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
      },
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
