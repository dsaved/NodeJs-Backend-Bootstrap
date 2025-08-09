import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsNGPhoneNumber } from '../class-validators';
import { enums } from '../../constructs';
import { BaseRequestDto } from './base-request-dto';

export class APIClientAuthRequestDto {
  @IsString()
  @IsNotEmpty()
  identity: string;

  @IsString()
  @IsNotEmpty()
  secret: string;
}

export class CreateAPIClientRequestDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty()
  clientEmail: string;

  @IsNotEmpty()
  @IsNGPhoneNumber()
  clientPhone: string;
}

export class UpdateAPIClientRequestDto {
  @IsNumber()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  clientName: string;

  @IsEmail({}, { message: 'Email is not valid' })
  @IsOptional()
  @IsNotEmpty()
  clientEmail: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNGPhoneNumber()
  clientPhone: string;
}

export class ChangeAPIClientStatusRequestDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  @IsEnum(enums.AccountStatusEnum)
  status: string;
}

export class ResetAPIClientPasswordRequestDto {
  @IsNotEmpty()
  id: number;
}

export class ListAPIClientRequestDto extends BaseRequestDto{}
