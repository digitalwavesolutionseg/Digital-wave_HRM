import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CandidateStage } from "../../../generated/prisma/client";

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  cvUrl?: string;

  @IsOptional()
  @IsEnum(CandidateStage)
  stage?: CandidateStage;

  @IsString()
  @IsNotEmpty()
  jobPostId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}