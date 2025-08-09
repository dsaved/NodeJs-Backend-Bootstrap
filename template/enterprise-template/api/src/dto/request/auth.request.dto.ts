import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsEmailOrPhoneNumber, IsStrongPassword } from '../class-validators';

export class RecoverUserRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmailOrPhoneNumber({
    message: 'User must be a valid email address or phone number',
  })
  user: string;
}

export class AuthUserRequestDto extends RecoverUserRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsOptional()
  isUser: boolean;
}
export class Activate2Fa {
  @IsString()
  @IsNotEmpty()
  secret: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}

export class Deactivate2Fa {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}

export class Verify2Fa extends Deactivate2Fa {}
