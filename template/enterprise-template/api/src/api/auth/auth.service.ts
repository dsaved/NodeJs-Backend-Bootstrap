import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  Activate2Fa,
  AuthUserRequestDto,
  Deactivate2Fa,
  RecoverUserRequestDto,
  Verify2Fa,
} from '../../dto/request/auth.request.dto';
import { auditAction } from '../../constructs/constant';
import { UsersService } from '../users/users.service';
import { RequestResponseDto } from '../../dto/response/base-response-dto';
import { UserAuthResponseDto } from '../../dto/response/auth.response.dto';
import { UserResponseDto } from '../../dto/response/user-response.dto';
import { User, Log } from '../../model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { envs } from '../../constructs';
import { TwoFactorService } from './two-factor.service';
import { ResetForgotAccountPassword } from '../../dto/request/user-request.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Log) private readonly logRepository: Repository<Log>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async login(
    data: AuthUserRequestDto,
  ): Promise<UserAuthResponseDto | UserResponseDto> {
    const _user = await this.usersService.login(data.user);
    if (!_user) {
      throw new NotFoundException('No user found with given credentials');
    }

    const isMatch = await bcrypt.compare(data.password, _user.password);
    if (isMatch) {
      // Prepare user data for JWT payload
      const _userData = new UserResponseDto(_user);
      const { createdAt, updatedAt, file, ...userData } = _userData;

      if (_user.isTwoFactorEnabled) {
        return _userData;
      }

      // Log the login action
      await this.logRepository.save({
        userId: _user.id,
        action: auditAction.LOGIN,
        description: 'User logged in successfully',
      });

      const jwtToken = this.jwtService.sign(userData);
      return new UserAuthResponseDto(_userData, jwtToken);
    }

    throw new NotAcceptableException('Incorrect credentials for login');
  }

  async recover(user: RecoverUserRequestDto): Promise<RequestResponseDto> {
    const _user = await this.usersService.findOne(user.user);
    if (!_user) {
      throw new NotFoundException('No user found with given credentials');
    }

    // Use the `usersService` to reset the account password
    return this.usersService.resetAccountPassword({ userId: _user.userId });
  }

  async resetForgotAccountPassword(
    data: ResetForgotAccountPassword,
  ): Promise<RequestResponseDto> {
    return this.usersService.resetForgotAccountPassword(data);
  }

  async generateTwoFactor(
    userEmail: string,
  ): Promise<{ qr: string; secret: string }> {
    const _user = await this.usersService.findOne(userEmail);
    if (!_user) {
      throw new NotFoundException('No user found with given email');
    }

    const { base32, otpauthUrl } = this.twoFactorService.generateSecret(
      envs.appEnv.appName,
      userEmail,
    );
    const qr = await this.twoFactorService.generateQRCode(otpauthUrl);
    return { qr, secret: base32 };
  }

  async activateTwoFactor(data: Activate2Fa): Promise<RequestResponseDto> {
    const user = await this.userRepository.findOne({
      where: { emailAddress: data.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = this.twoFactorService.validateCode(data.code, data.secret);
    if (!isValid) {
      throw new NotAcceptableException('Invalid 2FA code');
    }

    user.twoFactorSecret = data.secret;
    user.isTwoFactorEnabled = true;

    await this.userRepository.save(user);

    return {
      success: true,
      message: '2FA activated successfully',
    };
  }

  async deactivateTwoFactor(data: Deactivate2Fa): Promise<RequestResponseDto> {
    const user = await this.userRepository.findOne({
      where: { emailAddress: data.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.isTwoFactorEnabled) {
      throw new NotAcceptableException('2FA is already disabled');
    }

    const isValid = this.twoFactorService.validateCode(
      data.code,
      user.twoFactorSecret,
    );
    if (!isValid) {
      throw new NotAcceptableException('Invalid 2FA code');
    }
    user.twoFactorSecret = null;
    user.isTwoFactorEnabled = false;

    await this.userRepository.save(user);

    return {
      success: true,
      message: '2FA deactivated successfully',
    };
  }

  async verifyTwoFactor(data: Verify2Fa): Promise<UserAuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { emailAddress: data.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = this.twoFactorService.validateCode(
      data.code,
      user.twoFactorSecret,
    );
    if (!isValid) {
      throw new NotAcceptableException('Invalid 2FA code');
    }

    // Log the login action
    await this.logRepository.save({
      userId: user.id,
      action: auditAction.LOGIN,
      description: 'User logged in successfully',
    });

    // Prepare user data for JWT payload
    const _userData = new UserResponseDto(user);
    const { createdAt, updatedAt, file, ...userData } = _userData;
    const jwtToken = this.jwtService.sign(userData);

    return new UserAuthResponseDto(_userData, jwtToken);
  }
}
