import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as fc from 'fast-check';

import { PrismaService } from '../database';
import { AuthService } from './auth.service';

describe('AuthService PBT', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: {} },
        { provide: JwtService, useValue: { sign: () => 'token' } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('hashPassword then verifyPassword should return true for any password', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 64 }),
        async (password) => {
          const hash = await service.hashPassword(password);
          const result = await service.verifyPassword(password, hash);
          return result === true;
        },
      ),
      { numRuns: 20 },
    );
  });

  it('verifyPassword should return false for any wrong password', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 64 }),
        fc.string({ minLength: 1, maxLength: 64 }),
        async (password, wrongPassword) => {
          fc.pre(password !== wrongPassword);
          const hash = await service.hashPassword(password);
          const result = await service.verifyPassword(wrongPassword, hash);
          return result === false;
        },
      ),
      { numRuns: 20 },
    );
  });
});
