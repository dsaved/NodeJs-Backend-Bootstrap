import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { BaseRequestDto } from './base-request-dto';
import { enums, regExp } from '../../constructs';
import { MESSAGES } from '../../constructs/messages';
import { IsStrongPassword } from '../class-validators';

export class ChangeUserPasswordRequestDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  newPassword?: string;
}

export class ListUsersRequestDto extends BaseRequestDto {
  @IsEnum(enums.AccountStatusEnum)
  @IsOptional()
  status: enums.AccountStatusEnum;
}

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  @Matches(regExp.nameRegExp, {
    message: MESSAGES.nameRegExpError('First Name'),
  })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  @Matches(regExp.nameRegExp, {
    message: MESSAGES.nameRegExpError('Last Name'),
  })
  lastName: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  @Matches(regExp.nameRegExp, {
    message: MESSAGES.nameRegExpError('Middle Name'),
  })
  middleName: string;

  @IsEnum(enums.GenderEnum)
  gender: enums.GenderEnum;

  @IsMobilePhone()
  phoneNumber: string;

  @IsEmail()
  emailAddress: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsEnum(enums.AccountStatusEnum)
  status: enums.AccountStatusEnum;
}

export class CreateUserByAdminRequestDto extends CreateUserRequestDto {
  @IsOptional()
  password: string;
}

export class UpdateUserByAdminRequestDto extends CreateUserRequestDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsOptional()
  password: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  @Matches(regExp.nameRegExp, {
    message: MESSAGES.nameRegExpError('First Name'),
  })
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  @Matches(regExp.nameRegExp, {
    message: MESSAGES.nameRegExpError('Last Name'),
  })
  lastName: string;

  @IsOptional()
  @IsEnum(enums.GenderEnum)
  gender: enums.GenderEnum;

  @IsOptional()
  @IsMobilePhone()
  phoneNumber: string;

  @IsOptional()
  @IsEmail()
  emailAddress: string;
}

export class ChangeUserPasswordDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsStrongPassword()
  @IsNotEmpty()
  newPassword: string;
}

export class UpdatePasswordDto extends ChangeUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}

export class ResetForgotAccountPassword {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}

export class UpdateNameDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  @Matches(regExp.nameRegExp, {
    message: MESSAGES.nameRegExpError('First Name'),
  })
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  @Matches(regExp.nameRegExp, {
    message: MESSAGES.nameRegExpError('Last Name'),
  })
  lastName: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  @Matches(regExp.nameRegExp, {
    message: MESSAGES.nameRegExpError('Middle Name'),
  })
  middleName: string;
}

export class UpdateUserDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsEnum(enums.AccountStatusEnum)
  status?: enums.AccountStatusEnum;
}

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsEnum(enums.AccountStatusEnum)
  status: enums.AccountStatusEnum;
}
