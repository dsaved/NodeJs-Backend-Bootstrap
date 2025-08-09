import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ActionList, _KEY } from './actions.decorator';
import { AuthUserDto } from '../../dto/others/auth.response.dto';

@Injectable()
export class ActionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredActions = this.reflector.getAllAndOverride<ActionList[]>(
      _KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredActions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authUser: AuthUserDto = request.user;

    try {
      const permissions = authUser?.role?.permission;
      // get the current active route
      // for path like this /users/reset-password/:id get just /user
      const routePath = context.switchToHttp().getRequest().route.path;
      const basePath = `${routePath.split('/')[1]}`;

      // find the list of permission assigned to a user by the current accessed route
      const fetchPermission = permissions.accesses.find(
        (access) => access.key === basePath
      )?.actions || [];

      // check if the user has the neccessery permission to perform the action
      return requiredActions.some((permission) =>
        fetchPermission.includes(permission),
      );
    } catch (err: any) {
      console.log(err.message);
      throw new ForbiddenException('Permission validation failed');
    }
  }
}
