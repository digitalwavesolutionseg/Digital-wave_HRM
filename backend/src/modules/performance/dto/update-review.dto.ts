import { Type } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { ReviewStatus } from "../../../generated/prisma/client";

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsString()
  goals?: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;
}