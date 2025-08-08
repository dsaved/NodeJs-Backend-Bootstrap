import { Group } from '../../model';

export class GroupsResponseDto {
  id: number;
  groupName: string;
  scopeLevel: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Group) {
    this.id = data.id;
    this.groupName = data.groupName;
    this.createdAt = data.createdAt;
    this.scopeLevel = data.scopeLevel;
    this.updatedAt = data.updatedAt;
  }
}
