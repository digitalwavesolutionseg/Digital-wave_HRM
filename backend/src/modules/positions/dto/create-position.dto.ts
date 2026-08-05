import { Type } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { EmploymentType } from "../../../generated/prisma/client";

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  minSalary: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  maxSalary: number;

  @IsOptional()
  @IsString()
  description?: string;
}
