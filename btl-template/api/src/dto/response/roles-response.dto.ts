import { Permission } from '../../constructs/class';
import { Role } from '../../model';

export class RolesResponseDto {
  id: number;
  roleName: string;
  group: number;
  groupName: string;
  state: number;
  stateName: string;
  lga: number;
  lgaName: string;
  permission: Permission;

  constructor(data: Role) {
    this.id = data.id;
    this.roleName = data.roleName;
    this.group = data.group?.id;
    this.groupName = data.group?.groupName;
    this.state = data.state?.id;
    this.stateName = data.state?.stateName;
    this.lga = data.lga?.id;
    this.lgaName = data.lga?.lgaName;
    this.permission = data.permission;
  }
}
