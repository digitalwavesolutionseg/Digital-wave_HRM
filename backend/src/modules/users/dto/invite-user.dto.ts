import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

const ASSIGNABLE_ROLES = [
  "SUPER_ADMIN",
  "HR",
  "MANAGER",
  "FINANCE",
  "RECRUITER",
  "EMPLOYEE",
] as const;

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsIn(ASSIGNABLE_ROLES as unknown as string[])
  role?: string;
}
