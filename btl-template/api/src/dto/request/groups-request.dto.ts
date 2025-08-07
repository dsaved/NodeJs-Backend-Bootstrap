import { IsString, IsNotEmpty, IsInt, IsNumber } from 'class-validator';
import { BaseRequestDto } from './base-request-dto';

export class GroupDto {
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @IsNumber()
  @IsNotEmpty()
  scopeLevel: number;
}

export class ListGroupsRequestDto extends BaseRequestDto {}

export class UpdateGroupDto extends GroupDto {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
