import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { CandidateStage } from "../../../generated/prisma/client";

export class UpdateCandidateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  cvUrl?: string;

  @IsOptional()
  @IsEnum(CandidateStage)
  stage?: CandidateStage;

  @IsOptional()
  @IsString()
  jobPostId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}