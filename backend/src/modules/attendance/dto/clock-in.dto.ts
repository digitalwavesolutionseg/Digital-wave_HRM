import { IsNotEmpty, IsString } from "class-validator";

export class ClockInDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;
}