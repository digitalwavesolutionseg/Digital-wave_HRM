import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, Min } from "class-validator";

export class GeneratePayrollDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  month: number;

  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year: number;
}