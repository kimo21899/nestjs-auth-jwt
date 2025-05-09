import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';


@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // const roles = this.reflector.get(Roles, context.getHandler());
    const guardRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!guardRoles) {
      return true;
    }
    // Http Header token 확인
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // console.log(user.authority);

    // 역할 비교
    const hasRole = matchRoles(guardRoles, user.authority);
    if (!hasRole) {
      this.logger.warn(`User ${user.username} lacks required roles: ${guardRoles}`, 'RolesGuard');
      throw new ForbiddenException('필요한 권한이 없습니다.');
    }

    return true;
  }
}

// Define the matchRoles function
const matchRoles = (roles: string[], userRoles: string): boolean => {
  // console.log('roles==', roles);
  // console.log('userRoles=',userRoles);
  if (!Array.isArray(roles) || !(userRoles)) {    
    return false;
  }
  // 대소문자 무시 및 공백 제거
  const normalizedRoles = roles.map(role => role.trim().toUpperCase());
  return normalizedRoles.some(role => userRoles.includes(role));

};