export type UserRole = 'admin-operation' | 'admin-manager' | 'seller';

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
