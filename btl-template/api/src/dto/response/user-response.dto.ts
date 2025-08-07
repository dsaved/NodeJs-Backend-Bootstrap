import { User } from '../../model/users.model';
import { ImageData } from '../../constructs/interfaces';
import { enums } from '../../constructs';

class Role {
  id: number;
  roleName: string;
}
export class UserResponseDto {
  userId: number;
  firstName: string;
  lastName: string;
  middleName: string;
  gender: string;
  zone: string;
  state: string;
  stateCode: string;
  lga: string;
  lgaCode: string;
  ward: string;
  zoneId: number;
  role: Role;
  menus: any[];
  stateId: number;
  lgaId: number;
  wardId: number;
  wardCode: string;
  phc: string;
  phcId: number;
  address: string;
  requirePasswordChange: boolean;
  isTwoFactorEnabled: boolean;
  status: string;
  phoneNumber: string;
  emailAddress: string;
  file: ImageData;
  accountType: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: User) {
    this.userId = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.middleName = data.middleName;
    this.phoneNumber = data.phoneNumber;
    this.emailAddress = data.emailAddress;
    this.role = {
      id: data.role?.id,
      roleName: data.role?.roleName,
    };
    this.menus = data.role?.permission?.menus;
    this.gender = enums.genderFromNum(data.gender);
    this.zone = data.zone?.zoneName;
    this.state = data.state?.stateName;
    this.stateCode = data.state?.stateCode;
    this.lga = data.lga?.lgaName;
    this.lgaCode = data.lga?.lgaCode;
    this.zoneId = data.zone?.id;
    this.stateId = data.state?.id;
    this.lgaId = data.lga?.id;
    this.wardId = data.ward?.id;
    this.ward = data.ward?.wardName;
    this.wardCode = data?.ward?.id.toString();
    this.file = data.profileImage;
    this.status = enums.accountStatusFromNum(data.status);
    this.requirePasswordChange = data.requirePasswordChange;
    this.isTwoFactorEnabled = data.isTwoFactorEnabled;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class UpdatedByUserResponseDto {
  name: string;
  role: string;
  email: string;
  id: number;
  phone: string;
  gender: string;

  constructor(data: User) {
    this.id = data.id;
    this.role = data.role?.roleName;
    this.name = [data.firstName, data.middleName, data.lastName]
      .filter(Boolean)
      .join(' ');
    this.email = data.emailAddress;
    this.phone = data.phoneNumber;
    this.gender = enums.genderFromNum(data.gender);
  }
}
