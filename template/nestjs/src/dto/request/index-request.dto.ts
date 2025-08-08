import { IsNumberString, IsOptional } from 'class-validator';
import { BaseRequestDto } from './base-request-dto';

export class ListRolesOptionRequestDto extends BaseRequestDto {
  @IsOptional()
  @IsNumberString()
  groupId: number;
}

export class ListPhcsOptionRequestDto extends BaseRequestDto {
  @IsOptional()
  @IsNumberString()
  wardId: number;
}
