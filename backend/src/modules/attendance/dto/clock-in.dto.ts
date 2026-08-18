import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ClockInDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  employeeId?: string;
}