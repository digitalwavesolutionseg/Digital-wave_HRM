import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { InterviewStatus } from "../../../generated/prisma/client";

export class UpdateInterviewDto {
  @IsOptional()
  @IsString()
  candidateId?: string;

  @IsOptional()
  @IsString()
  interviewerId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;
}