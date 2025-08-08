import { enums } from '../../constructs';

export interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: enums.GenderEnum;
  phoneNumber?: string;
  emailAddress: string;
  password?: string;
  verified?: boolean;
  requirePasswordChange?: boolean;
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface CreateUserInput {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: enums.GenderEnum;
  phoneNumber?: string;
  emailAddress: string;
  password?: string;
  verified?: boolean;
  requirePasswordChange?: boolean;
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  status?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: enums.GenderEnum;
  phoneNumber?: string;
  emailAddress?: string;
  password?: string;
  verified?: boolean;
  requirePasswordChange?: boolean;
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  status?: string;
}

// Validation functions for enum fields
export const validateUserGender = (gender: any): gender is enums.GenderEnum => {
  return Object.values(enums.GenderEnum).includes(gender);
};

export const validateUserStatus = (status: any): status is enums.AccountStatusEnum => {
  return Object.values(enums.AccountStatusEnum).includes(status);
};

// Default values
export const defaultUserValues = {
  verified: false,
  requirePasswordChange: false,
  isTwoFactorEnabled: false,
  status: enums.AccountStatusEnum.ACTIVE,
};
