import { Type } from "class-transformer";
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from "class-validator";

export class CreateLeaveDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  days: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}