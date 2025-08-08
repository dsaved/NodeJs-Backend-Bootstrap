import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Activate2Fa,
  AuthUserRequestDto,
  Deactivate2Fa,
  RecoverUserRequestDto,
  Verify2Fa,
} from '../../dto/request/auth.request.dto';
import { UserAuthResponseDto } from '../../dto/response/auth.response.dto';
import { NoAuth } from '../../decorators/public.decorator';
import { RequestResponseDto } from '../../dto/response/base-response-dto';
import { UserResponseDto } from '../../dto/response/user-response.dto';
import { ResetForgotAccountPassword } from '../../dto/request/user-request.dto';

@NoAuth()
@Controller('/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/login')
  async login(
    @Body() data: AuthUserRequestDto,
  ): Promise<UserAuthResponseDto | UserResponseDto> {
    return this.service.login(data);
  }

  @Post('/recover')
  async recover(@Body() data: RecoverUserRequestDto) {
    if (!data.user) {
      throw new BadRequestException('user is required or malformed');
    }

    return this.service.recover(data);
  }

  @Post('/reset-password')
  async resetForgotAccountPassword(@Body() data: ResetForgotAccountPassword) {
    return await this.service.resetForgotAccountPassword(data);
  }

  @Get('/2fa/generate/:email')
  async generate(
    @Param('email') userEmail: string,
  ): Promise<{ qr: string; secret: string }> {
    return await this.service.generateTwoFactor(userEmail);
  }

  @Post('/2fa/activate')
  async activate(@Body() data: Activate2Fa): Promise<RequestResponseDto> {
    return await this.service.activateTwoFactor(data);
  }

  @Post('/2fa/deactivate')
  async deactivate(@Body() data: Deactivate2Fa): Promise<RequestResponseDto> {
    return await this.service.deactivateTwoFactor(data);
  }

  @Post('/2fa/verify')
  verify(@Body() data: Verify2Fa): Promise<UserAuthResponseDto> {
    return this.service.verifyTwoFactor(data);
  }
}
