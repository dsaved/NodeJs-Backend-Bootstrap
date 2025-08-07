import { Group, Role } from "src/model";

export class AuthUserDto {
  userId: number;
  firstName: string;
  lastName: string;
  middleName: string;
  emailAddress: string;
  phoneNumber: string;
  stateId: number;
  lgaId: number;
  wardId: number
  nin: string;
  gender: string;
  role: Role;
}
