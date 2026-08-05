import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { InterviewStatus } from "../../../generated/prisma/client";

export class CreateInterviewDto {
  @IsString()
  @IsNotEmpty()
  candidateId: string;

  @IsString()
  @IsNotEmpty()
  interviewerId: string;

  @IsDateString()
  scheduledAt: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;
}