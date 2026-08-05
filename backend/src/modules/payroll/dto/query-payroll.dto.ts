import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { PayrollStatus } from "../../../generated/prisma/client";

export class QueryPayrollDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  month?: number;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;
}