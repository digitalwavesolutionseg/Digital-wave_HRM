import { IsNotEmpty, IsString } from "class-validator";

export class ClockOutDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}