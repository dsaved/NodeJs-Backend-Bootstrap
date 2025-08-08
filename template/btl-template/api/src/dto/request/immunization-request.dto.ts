import { IsEnum, IsNumberString, IsOptional } from 'class-validator';
import { BaseRequestDto } from './base-request-dto';
import { enums } from 'src/constructs';

export class ListImmunizationDto extends BaseRequestDto {
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
  @IsEnum(enums.VaccinationStatusEnum)
  status: enums.VaccinationStatusEnum;
}

export class ImmunizationStatisticDto extends ListImmunizationDto {}

export class ListImmunizationHistoryDto extends BaseRequestDto {}
