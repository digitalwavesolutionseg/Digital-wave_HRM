import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { AnnouncementCategory } from "../../../generated/prisma/client";

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsIn(Object.values(AnnouncementCategory))
  category?: AnnouncementCategory;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsIn(Object.values(AnnouncementCategory))
  category?: AnnouncementCategory;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}