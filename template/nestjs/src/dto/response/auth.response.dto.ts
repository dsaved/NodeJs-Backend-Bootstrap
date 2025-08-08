import { UserResponseDto } from './user-response.dto';

export class UserAuthResponseDto {
  userId: number;
  firstName: string;
  lastName: string;
  middleName: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  file: ImageData;
  accountType: string;
  menus: any[];
  jwtToken: string;
  requirePasswordChange: boolean;
  stateId: number;
  lgaId: number;
  wardId: number;
  state: string;
  lga: string;
  ward: string;

  constructor(data: UserResponseDto, token: string) {
    this.userId = data.userId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.middleName = data.middleName;
    this.phoneNumber = data.phoneNumber;
    this.emailAddress = data.emailAddress;
    this.requirePasswordChange = data.requirePasswordChange;
    this.jwtToken = token;
    this.gender = data.gender;
  }
}
