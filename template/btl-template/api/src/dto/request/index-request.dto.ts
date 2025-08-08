import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { classes } from '../../constructs';
import { Type } from 'class-transformer';
import { BaseRequestDto } from './base-request-dto';

export class UploadNinRequestDto {
  @IsNotEmpty()
  @IsString()
  nin: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => classes.NinObject)
  ninData: classes.NinObject;
}

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