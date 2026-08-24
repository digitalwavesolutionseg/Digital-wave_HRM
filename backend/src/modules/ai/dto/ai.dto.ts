import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpdateAiSettingsDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() baseUrl?: string;
  @IsOptional() @IsString() apiKey?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @Min(0) @Max(2) temperature?: number;
  @IsOptional() @IsInt() @Min(64) @Max(32000) maxOutputTokens?: number;
  @IsOptional() @IsInt() @Min(5000) @Max(300000) requestTimeoutMs?: number;
  @IsOptional() @IsInt() @Min(1000) monthlyTokenLimit?: number;
  @IsOptional() @IsInt() @Min(1000) perUserMonthlyTokenLimit?: number;
  @IsOptional() @IsString() allowedRoles?: string;
  @IsOptional() @IsBoolean() writeActionsEnabled?: boolean;
}

export class TestConnectionDto {
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() baseUrl?: string;
  @IsOptional() @IsString() apiKey?: string;
  @IsOptional() @IsString() model?: string;
}

export class ChatDto {
  @IsString() @IsNotEmpty() message: string;
  @IsOptional() @IsString() conversationId?: string;
}
