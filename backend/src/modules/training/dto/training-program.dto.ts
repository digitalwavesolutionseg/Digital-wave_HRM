import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from "class-validator";
import { TrainingStatus } from "../../../generated/prisma/client";

export class CreateTrainingProgramDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  instructor?: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  durationHours: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTrainingProgramDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  instructor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  durationHours?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class EnrollTrainingDto {
  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  completionRate?: number;

  @IsOptional()
  @IsString()
  status?: TrainingStatus;
}