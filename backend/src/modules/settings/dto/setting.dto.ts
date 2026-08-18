import { IsNotEmpty, IsString } from "class-validator";

export class SetSettingDto {
  @IsNotEmpty()
  value: any;
}

export class UpsertSettingsDto {
  [key: string]: any;
}