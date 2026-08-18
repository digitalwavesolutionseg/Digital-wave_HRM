import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import {
  AssetCondition,
  AssetStatus,
} from "../../../generated/prisma/client";

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsIn(Object.values(AssetCondition))
  condition?: AssetCondition;

  @IsOptional()
  @IsIn(Object.values(AssetStatus))
  status?: AssetStatus;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsIn(Object.values(AssetCondition))
  condition?: AssetCondition;

  @IsOptional()
  @IsIn(Object.values(AssetStatus))
  status?: AssetStatus;
}

export class AssignAssetDto {
  @IsOptional()
  @IsString()
  assignedToId?: string | null;
}