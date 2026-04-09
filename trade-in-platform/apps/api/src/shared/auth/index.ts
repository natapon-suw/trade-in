export { AuthModule } from './auth.module';
export { AuthService } from './auth.service';
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { RolesGuard } from './guards/roles.guard';
export { Roles, ROLES_KEY } from './decorators/roles.decorator';
export { CurrentUser } from './decorators/current-user.decorator';
export { ROLE_PERMISSIONS } from './types';
export type { AuthContext, JwtPayload, UserRole } from './types';
