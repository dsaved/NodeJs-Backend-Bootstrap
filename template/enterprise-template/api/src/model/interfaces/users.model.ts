import { enums } from '../constructs';

// Base interface that all models should extend
export interface BaseModel {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// User model interface
export interface User extends BaseModel {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: number; // GenderEnumNum: 0 = male, 1 = female
  phoneNumber?: string;
  emailAddress: string;
  nin?: string;
  profileImageId?: string;
  zoneId?: string;
  stateId?: string;
  lgaId?: string;
  wardId?: string;
  groupId: string;
  password?: string;
  verified?: boolean;
  requirePasswordChange?: boolean;
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  roleId?: string;
  status: number; // AccountStatusEnumNum values
}

export interface CreateUserInput {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: number;
  phoneNumber?: string;
  emailAddress: string;
  nin?: string;
  profileImageId?: string;
  zoneId?: string;
  stateId?: string;
  lgaId?: string;
  wardId?: string;
  groupId: string;
  password?: string;
  verified?: boolean;
  requirePasswordChange?: boolean;
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  roleId?: string;
  status?: number;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: number;
  phoneNumber?: string;
  emailAddress?: string;
  nin?: string;
  profileImageId?: string;
  zoneId?: string;
  stateId?: string;
  lgaId?: string;
  wardId?: string;
  groupId?: string;
  password?: string;
  verified?: boolean;
  requirePasswordChange?: boolean;
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  roleId?: string;
  status?: number;
}

// Validation functions for User enum fields
export const validateUserGender = (gender: any): gender is number => {
  return [0, 1].includes(gender); // GenderEnumNum values
};

export const validateUserStatus = (status: any): status is number => {
  return Object.values(enums.AccountStatusEnumNum).includes(status);
};

// Default values for User
export const defaultUserValues = {
  verified: false,
  requirePasswordChange: false,
  isTwoFactorEnabled: false,
  status: enums.AccountStatusEnumNum.active,
};
