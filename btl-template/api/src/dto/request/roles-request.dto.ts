import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ArrayNotEmpty,
  ValidateNested,
  IsEnum,
  IsNumberString,
  IsInt,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActionList } from '../../middlewares/actions';
import { BaseRequestDto } from './base-request-dto';

class Access {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ActionList, { each: true })
  actions: ActionList[];
}

export class PermissionDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Menu is required.' })
  menus: any[];

  @IsArray()
  @ArrayNotEmpty({ message: 'Access is required.' })
  accesses: Access[];
}

export class RoleDto {
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @IsNumber()
  @IsNotEmpty()
  group: number;

  @IsNumber()
  @IsOptional()
  state: number;

  @IsNumber()
  @IsOptional()
  lga: number;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permission: PermissionDto;
}

export class ListRolesRequestDto extends BaseRequestDto {}

export class UpdateRoleDto extends RoleDto {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
