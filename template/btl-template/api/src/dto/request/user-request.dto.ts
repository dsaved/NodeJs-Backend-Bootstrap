import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { BaseRequestDto } from './base-request-dto';
import { enums, regExp } from '../../constructs';
import { IsNGPhoneNumber, IsStrongPassword } from '../class-validators';
import { MESSAGES } from '../../constructs/messages';

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
  @IsNumberString()
  @IsOptional()
  phcId: number;

  @IsEnum(enums.AccountStatusEnum)
  @IsOptional()
  status: enums.AccountStatusEnum;

  @IsNumberString()
  @IsOptional()
  roleId: number;

  @IsNumberString()
  @IsOptional()
  groupId: number;
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
  gender: string;

  @IsNGPhoneNumber()
  phoneNumber: string;

  @IsEmail()
  emailAddress: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsNumber()
  fileId: number;

  @IsOptional()
  @IsNumber()
  zone: number;

  @IsOptional()
  @IsNumber()
  state: number;

  @IsOptional()
  @IsNumber()
  lga: number;

  @IsNotEmpty()
  @IsNumber()
  group: number;

  @IsOptional()
  @IsNumber()
  role: number;

  @IsOptional()
  @IsNumber()
  ward: number;

  @IsOptional()
  @ValidateIf((o) => o.ward !== undefined && o.ward !== null)
  @IsNumber()
  phc: number;

  @IsOptional()
  @IsEnum(enums.AccountStatusEnumNum)
  status: number;
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
  gender: string;

  @IsOptional()
  @IsNGPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsEmail()
  emailAddress: string;

  @IsOptional()
  @IsNumber()
  group: number;
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

  @IsNumber()
  @IsOptional()
  roleId?: number;

  @IsOptional()
  @IsEnum(enums.AccountStatusEnumNum)
  status?: enums.AccountStatusEnumNum;
}

export class UpdateNinDto {
  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'NIN must be exactly 11 digits' })
  nin: string;
}

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsEnum(enums.AccountStatusEnum)
  status: enums.AccountStatusEnum;
}
