import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { NO_AUTH_KEY } from '../decorators/public.decorator';

@Injectable()
export class UserAuthGuard extends AuthGuard('jwt-strategy-user') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const controller = context.getClass();
    // Check if @NoAuth() is applied at method or controller level
    const noAuth =
      this.reflector.get<boolean>(NO_AUTH_KEY, handler) ||
      this.reflector.get<boolean>(NO_AUTH_KEY, controller);
    if (noAuth) {
      return true; // Skip authentication
    }

    try {
      const canActivate = (await super.canActivate(context)) as boolean;
      if (canActivate) {
        return true;
      }
    } catch (err) {
      console.log('*****************', err);
      throw new UnauthorizedException(
        'You do not have permission to access this resource',
      );
    }
  }
}