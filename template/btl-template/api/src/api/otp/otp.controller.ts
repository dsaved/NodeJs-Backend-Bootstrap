import { Body, Controller, Post } from '@nestjs/common';
import { OTPService } from './otp.service';
import { OTPRequestDto } from '../../dto/request/otp-request.dto';
import { NoAuth } from '../../decorators/public.decorator';

@NoAuth()
@Controller({ path: '/otp' })
export class OTPController {
  constructor(private readonly service: OTPService) {}

  @Post('/send')
  async sendOtp(@Body() data: OTPRequestDto) {
    return await this.service.sendOtp(data);
  }

  @Post('/validate')
  async validateOtp(@Body() data: OTPRequestDto) {
    return await this.service.validateOtp(data);
  }

  @Post('/resend')
  async resendOtp(@Body() data: OTPRequestDto) {
    return await this.service.resendOtp(data.email);
  }
}
