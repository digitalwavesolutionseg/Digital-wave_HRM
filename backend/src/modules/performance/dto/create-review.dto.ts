import { Type } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { ReviewStatus } from "../../../generated/prisma/client";

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  reviewerId: string;

  @IsString()
  @IsNotEmpty()
  period: string;

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