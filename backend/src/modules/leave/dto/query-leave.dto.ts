import { IsEnum, IsOptional, IsString } from "class-validator";
import { LeaveStatus } from "../../../generated/prisma/client";

export class QueryLeaveDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;
}