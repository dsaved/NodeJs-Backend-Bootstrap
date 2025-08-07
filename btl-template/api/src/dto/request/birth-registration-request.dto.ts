import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseRequestDto } from './base-request-dto';

class AnthropometricDto {
  @IsOptional()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsNumber()
  height: number;

  @IsOptional()
  @IsBoolean()
  lessThan2Point5kgAtBirth: boolean;
}

export class CreateBirthRegistrationDto {
  @IsOptional()
  @IsNumber()
  registrationWardId: number;

  @IsOptional()
  immunizationCertificateNumber: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  certificateNumber: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  childFirstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  childSurname: string;

  @IsOptional()
  @IsString()
  @MaxLength(11)
  childNin: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  childMiddleName: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsNumber()
  childGender: number;

  @IsOptional()
  @IsNumber()
  childOriginCountryId: number;

  @IsOptional()
  @IsNumber()
  childOriginStateId: number;

  @IsNotEmpty()
  @IsString()
  stateCode: string;

  @IsNotEmpty()
  @IsString()
  lgaCode: string;

  @IsNotEmpty()
  @IsString()
  wardCode: string;

  @IsOptional()
  @IsNumber()
  childOriginLgaId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  motherFirstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  motherSurname: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  motherMiddleName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  motherMaidenName: string;

  @IsOptional()
  @IsNumber()
  @Min(9)
  motherAgeAtChildBirth: number;

  @IsNotEmpty()
  @IsNumber()
  motherOriginCountryId: number;

  @IsNotEmpty()
  @IsNumber()
  motherOriginStateId: number;

  @IsNotEmpty()
  @IsNumber()
  motherOriginLgaId: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fatherFirstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fatherSurname: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fatherMiddleName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fatherMaidenName: string;

  @IsOptional()
  @IsNumber()
  fatherOriginCountryId: number;

  @IsOptional()
  @IsNumber()
  fatherOriginStateId: number;

  @IsOptional()
  @IsNumber()
  fatherOriginLgaId: number;

  @IsOptional()
  @IsNumber()
  @Min(9)
  fatherAgeAtChildBirth: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  survivingChildren: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  deadChildren: number;

  @IsNotEmpty()
  @IsBoolean()
  isBabyTwin: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isBabyBottleFed: boolean;

  @IsNotEmpty()
  @IsBoolean()
  motherNeedFamilySupport: boolean;

  @IsNotEmpty()
  @IsBoolean()
  underweightSiblings: boolean;

  @IsNotEmpty()
  @IsBoolean()
  anyUnderlyingMedicalCondition: boolean;

  @IsOptional()
  @IsString()
  underlyingMedicalCondition: string;

  @IsNotEmpty()
  @IsNumber()
  residenceStateId: number;

  @IsNotEmpty()
  @IsNumber()
  residenceLgaId: number;

  @IsOptional()
  @IsString()
  residenceAddress: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  contactEmail: string;

  @IsNotEmpty()
  @IsNumberString()
  @IsMobilePhone(null)
  contactPhone1: string;

  @IsOptional()
  @IsNumberString()
  @IsMobilePhone(null)
  contactPhone2: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnthropometricDto)
  anthropometrics: AnthropometricDto[];
}

export class ListBirthregistrationRequestDto extends BaseRequestDto {}