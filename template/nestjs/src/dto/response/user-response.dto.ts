import { User } from '../../model/users.model';
import { enums } from '../../constructs';

export class UserResponseDto {
  userId: number;
  firstName: string;
  lastName: string;
  middleName: string;
  gender: string;
  address: string;
  requirePasswordChange: boolean;
  isTwoFactorEnabled: boolean;
  status: string;
  phoneNumber: string;
  emailAddress: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: User) {
    this.userId = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.middleName = data.middleName;
    this.phoneNumber = data.phoneNumber;
    this.emailAddress = data.emailAddress;
    this.gender = enums.GenderEnum[data.gender];
    this.status = data.status;
    this.requirePasswordChange = data.requirePasswordChange;
    this.isTwoFactorEnabled = data.isTwoFactorEnabled;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
