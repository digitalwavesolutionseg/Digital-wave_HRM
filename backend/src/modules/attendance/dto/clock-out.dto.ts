import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ClockOutDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  employeeId?: string;
}