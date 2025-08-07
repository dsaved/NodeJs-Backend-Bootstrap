import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { BaseRequestDto } from './base-request-dto';
import { enums } from '../../constructs';

export class CreatePhcDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  phcName: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsNotEmpty()
  @IsNumber()
  stateId: string;

  @IsNotEmpty()
  @IsNumber()
  lgaId: string;

  @IsNotEmpty()
  @IsNumber()
  wardId: string;
}

export class UpdatePhcDto extends CreatePhcDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  phcName: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsNumber()
  stateId: string;

  @IsOptional()
  @IsNumber()
  lgaId: string;

  @IsOptional()
  @IsNumber()
  wardId: string;
}

export class UpdatePhcStatusDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}

export class ListPhcsRequestDto extends BaseRequestDto {
  @IsOptional()
  @IsNumberString()
  stateId: number;

  @IsOptional()
  @IsNumberString()
  lgaId: number;

  @IsOptional()
  @IsNumberString()
  wardId: number;

  @IsOptional()
  @IsEnum([enums.AccountStatusEnum.ACTIVE, enums.AccountStatusEnum.INACTIVE])
  status: enums.AccountStatusEnum;
}

export class StatsCountPhcsRequestDto extends ListPhcsRequestDto {}
