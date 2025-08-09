import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { BaseRequestDto } from './base-request-dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateVaccineDto {
  @IsNotEmpty()
  @IsString()
  vaccineName: string;

  @IsNotEmpty()
  @IsString()
  vaccineNumber: string;

  @IsNotEmpty()
  @IsString()
  manufacturer: string;

  @IsNotEmpty()
  @IsString()
  batchNumber: string;

  @IsNotEmpty()
  @IsDateString()
  expirationDate: Date;

  @IsNotEmpty()
  @IsNumber()
  stockLevel: number;

  @IsNotEmpty()
  @IsNumber()
  minTemperature: number;

  @IsNotEmpty()
  @IsNumber()
  maxTemperature: number;

  @IsNotEmpty()
  @IsNumber()
  stateId: number;

  @IsNotEmpty()
  @IsNumber()
  lgaId: number;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  storageLevel: string;
}

export class ListVaccineRequestDto extends BaseRequestDto {}

export class UpdateVaccineDto extends PartialType(CreateVaccineDto) {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class GetVaccinationStatistics {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
