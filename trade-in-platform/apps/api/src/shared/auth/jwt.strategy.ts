import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../database';
import { UnauthorizedException } from '../errors';
import { AuthContext, JwtPayload, ROLE_PERMISSIONS, UserRole } from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(
    payload: Pick<JwtPayload, 'sub' | 'email' | 'role'>,
  ): Promise<AuthContext> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Invalid or inactive user');
    }

    const role: UserRole = payload.role;

    return {
      userId: user.id,
      email: user.email,
      role,
      permissions: ROLE_PERMISSIONS[role],
    };
  }
}
