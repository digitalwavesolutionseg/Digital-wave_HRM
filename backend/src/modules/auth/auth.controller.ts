import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
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
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("register")
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("refresh")
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post("forgot-password")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post("reset-password")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post("request-login-otp")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  requestLoginOtp(@Body() dto: RequestLoginOtpDto) {
    return this.authService.requestLoginOtp(dto);
  }

  @Post("verify-login-otp")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  verifyLoginOtp(@Body() dto: VerifyLoginOtpDto) {
    return this.authService.verifyLoginOtp(dto);
  }

  @Post("verify-email")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post("resend-verification")
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @Post("accept-invite")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.authService.acceptInvite(dto);
  }

  @Post("change-password")
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  changePassword(@CurrentUser("id") userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser("id") userId: string) {
    return this.authService.me(userId);
  }

  @Post("logout")
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser("id") userId: string) {
    return this.authService.logout(userId);
  }
}