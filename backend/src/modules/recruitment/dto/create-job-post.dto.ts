import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { JobPostStatus } from "../../../generated/prisma/client";

export class CreateJobPostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  openings?: number;

  @IsOptional()
  @IsString()
  salaryRange?: string;

  @IsOptional()
  @IsEnum(JobPostStatus)
  status?: JobPostStatus;

  @IsOptional()
  @IsString()
  description?: string;
}