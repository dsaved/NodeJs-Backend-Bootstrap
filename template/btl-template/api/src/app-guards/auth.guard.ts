import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import crypto from 'crypto';
import moment from 'moment';
import { Reflector } from '@nestjs/core';
import { envs } from '../constructs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class DefaultAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const controller = context.getClass();
    // Check if @NoAuth() is applied at method or controller level
    const isPublic =
      this.reflector.get<boolean>(IS_PUBLIC_KEY, handler) ||
      this.reflector.get<boolean>(IS_PUBLIC_KEY, controller);

    if (isPublic) {
      return true; // Skip authentication
    }

    // Apply normal authentication logic here
    return this.checkAuthentication(context);
  }

  private checkAuthentication(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Missing x-signature token');
    }

    const httpMethod = request.method.toLowerCase();
    const urlPath = request.path.toLowerCase();

    // Create a 2-minute window ([-1, 0, +1] minutes)
    const currentUtcMoment = moment().utc();
    const isValid = Array.from({ length: 3 }, (_, i) => i - 1).some(
      (offset) => {
        const utcTimeWithOffset = currentUtcMoment
          .clone()
          .add(offset, 'minutes')
          .format('YYYYDDMMHHmm');
        const sign = crypto.createHash('SHA256');
        sign.update(envs.authData.appName);
        sign.update(
          `${httpMethod}${urlPath}${envs.authData.preSharedApiKey}${utcTimeWithOffset}`,
        );
        const expectedSignature = sign.digest('hex');
        console.log(`${token} === ${expectedSignature}`);
        return token === expectedSignature;
      },
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }
    return true;
  }

  private extractTokenFromHeader(
    request: Request,
  ): string | string[] | undefined {
    return request.headers['x-signature'];
  }
}
