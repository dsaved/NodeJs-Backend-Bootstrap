import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtEnv } from '../constructs/env';
import { PassportStrategy } from '@nestjs/passport';
import { enums } from '../constructs';
import { AuthUserDto } from '../dto/others/auth.response.dto';
import { User } from '../model/users.model';
import { UserAuthResponseDto } from '../dto/response/auth.response.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-strategy-user',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtEnv.secret,
    });
  }

  async validate(payload: UserAuthResponseDto): Promise<AuthUserDto> {
    if (payload.userId) {
      // check if this user is active
      const _user = await User.findOne({
        where: {
          id: payload.userId,
          status: enums.AccountStatusEnumNum.active,
        },
        relations: {
          role: {
            group: true,
          },
          ward: true,
        },
        select: {
          ward: {
            id: true,
          },
        },
      });
      if (!_user) {
        throw new UnauthorizedException('Invalid Authorization key');
      }

      return {
        userId: _user.id,
        firstName: _user.firstName,
        lastName: _user.lastName,
        middleName: _user.middleName,
        emailAddress: _user.emailAddress,
        phoneNumber: _user.phoneNumber,
        stateId: payload.stateId,
        lgaId: payload.lgaId,
        wardId: _user.ward?.id,
        nin: _user.nin,
        gender: payload.gender,
        role: _user.role,
      };
    } else {
      throw new UnauthorizedException('No authorization supplied');
    }
  }
}
