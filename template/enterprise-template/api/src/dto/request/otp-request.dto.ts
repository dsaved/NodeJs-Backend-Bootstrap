import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class OTPRequestDto {
  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  otp: string;
}
