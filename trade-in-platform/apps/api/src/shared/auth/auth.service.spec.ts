import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../database';
import { UnauthorizedException } from '../errors';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('hashPassword', () => {
    it('should return a hash different from the original password', async () => {
      const password = 'my-secret-password';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'same-password';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'test-password';
      const hash = await service.hashPassword(password);

      const result = await service.verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hash = await service.hashPassword('correct-password');

      const result = await service.verifyPassword('wrong-password', hash);
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should return a signed JWT string', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin-operation' as const,
      };

      const token = service.generateToken(user);

      expect(token).toBe('signed-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        email: 'test@example.com',
        role: 'admin-operation',
      });
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN_OPERATION',
      passwordHash: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    beforeEach(async () => {
      mockUser.passwordHash = await service.hashPassword('valid-password');
    });

    it('should return access token and user context on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.login('admin@example.com', 'valid-password');

      expect(result.accessToken).toBe('signed-token');
      expect(result.user).toEqual({
        userId: 'user-1',
        email: 'admin@example.com',
        role: 'admin-operation',
        permissions: ['assessment.*', 'customer.*', 'stock.add'],
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('unknown@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login('admin@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
