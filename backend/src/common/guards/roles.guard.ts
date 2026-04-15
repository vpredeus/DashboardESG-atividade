import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

type AuthenticatedUser = {
  role?: string | null;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const userRole = request.user?.role;

    if (!userRole) {
      throw new ForbiddenException('Acesso negado: usuario sem perfil definido');
    }

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException('Acesso negado: permissao insuficiente');
    }

    return true;
  }
}
