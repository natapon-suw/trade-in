import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../../../shared/auth';
import { UnauthorizedException } from '../../../shared/errors';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'login'>>;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /login', () => {
    const loginDto = { email: 'admin@example.com', password: 'secret123' };

    it('should return accessToken and user on successful login', async () => {
      const expected = {
        accessToken: 'jwt-token',
        user: {
          userId: 'user-1',
          email: 'admin@example.com',
          role: 'admin-operation' as const,
          permissions: ['assessment.*', 'customer.*', 'stock.add'],
        },
      };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expected);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should throw 401 for invalid credentials', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });
});
