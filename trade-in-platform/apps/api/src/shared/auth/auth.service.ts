import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../database';
import { UnauthorizedException } from '../errors';
import { AuthContext, JwtPayload, UserRole, ROLE_PERMISSIONS } from './types';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: { id: string; email: string; role: UserRole }): string {
    const payload: Pick<JwtPayload, 'sub' | 'email' | 'role'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; user: AuthContext }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const role = this.mapPrismaRole(user.role);
    const accessToken = this.generateToken({
      id: user.id,
      email: user.email,
      role,
    });

    return {
      accessToken,
      user: {
        userId: user.id,
        email: user.email,
        role,
        permissions: ROLE_PERMISSIONS[role],
      },
    };
  }

  private mapPrismaRole(prismaRole: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      ADMIN_OPERATION: 'admin-operation',
      ADMIN_MANAGER: 'admin-manager',
      SELLER: 'seller',
    };
    return roleMap[prismaRole] ?? 'seller';
  }
}
