import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { enums } from 'src/constructs';

export class VaccinationDataDto {
  @IsNotEmpty()
  @IsNumber()
  vaccineId: number;

  @IsNotEmpty()
  @IsNumber()
  vaccinationScheduleId: number;
}

export class AdministerVaccinationDto {
  @IsNotEmpty()
  @IsNumber()
  birthRegistrationId: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VaccinationDataDto)
  vaccinationScheduleData: VaccinationDataDto[];

  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @IsNotEmpty()
  @IsNumber()
  height: number;
}

export class GetVaccinationStatistics {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(enums.OrderTypeEnum)
  orderBy: enums.OrderTypeEnum;

  @IsOptional()
  @IsNumberString()
  limit: number;
}
