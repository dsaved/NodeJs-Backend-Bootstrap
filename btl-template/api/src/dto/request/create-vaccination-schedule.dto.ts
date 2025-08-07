import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { BaseRequestDto } from './base-request-dto';

export class CreateVaccinationScheduleDto {
  @IsNotEmpty()
  @IsString()
  vaccineName: string;

  @IsNotEmpty()
  @IsString()
  vaccineType: string;

  @IsNotEmpty()
  @IsString()
  dosage: string;

  @IsNotEmpty()
  @IsString()
  routesOfAdministration: string;

  @IsNotEmpty()
  @IsNumber()
  dayOfAdministration: number;

  @IsOptional()
  @IsNumber()
  windowOfAdministration: number;
}

export class UpdateVaccinationScheduleDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  vaccineName?: string;

  @IsOptional()
  @IsString()
  vaccineType?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  routesOfAdministration?: string;

  @IsOptional()
  @IsNumber()
  dayOfAdministration?: number;

  @IsOptional()
  @IsNumber()
  windowOfAdministration?: number;
}


export class ListVaccinationsRequestDto extends BaseRequestDto {}