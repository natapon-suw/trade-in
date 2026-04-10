import { SellerAuthController } from './seller-auth.controller';
import { ConflictException } from '../../shared/errors';

describe('SellerAuthController', () => {
  let controller: SellerAuthController;
  let authService: { login: jest.Mock; hashPassword: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };

  beforeEach(() => {
    authService = {
      login: jest.fn(),
      hashPassword: jest.fn(),
    };
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    controller = new SellerAuthController(authService as any, prisma as any);
  });

  describe('login', () => {
    it('should delegate to AuthService.login', async () => {
      const result = { accessToken: 'tok', user: { userId: '1', email: 'a@b.com', role: 'seller', permissions: [] } };
      authService.login.mockResolvedValue(result);

      const response = await controller.login({ email: 'a@b.com', password: 'pass123' });

      expect(authService.login).toHaveBeenCalledWith('a@b.com', 'pass123');
      expect(response).toEqual(result);
    });
  });

  describe('register', () => {
    it('should create a new seller user and return without passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      authService.hashPassword.mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        email: 'seller@test.com',
        name: 'Seller',
        passwordHash: 'hashed',
        role: 'SELLER',
      });

      const response = await controller.register({
        email: 'seller@test.com',
        password: 'pass123',
        name: 'Seller',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'seller@test.com' } });
      expect(authService.hashPassword).toHaveBeenCalledWith('pass123');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'seller@test.com',
          passwordHash: 'hashed',
          name: 'Seller',
          role: 'SELLER',
        },
      });
      expect(response).toEqual({ id: 'uuid-1', email: 'seller@test.com', name: 'Seller' });
      expect(response).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing', email: 'dup@test.com' });

      await expect(
        controller.register({ email: 'dup@test.com', password: 'pass123', name: 'Dup' }),
      ).rejects.toThrow(ConflictException);

      expect(authService.hashPassword).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });
});
