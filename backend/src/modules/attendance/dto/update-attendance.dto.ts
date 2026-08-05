import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from "class-validator";
import { AttendanceStatus } from "../../../generated/prisma/client";

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  overtimeMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}