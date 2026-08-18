import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Length } from "class-validator";
import { Role } from "../../../common/decorators/roles.decorator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(Object.values(Role))
  role?: Role;
}
