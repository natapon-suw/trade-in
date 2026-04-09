import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

import { ForbiddenException } from '../../errors';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const createMockContext = (user?: Record<string, unknown>): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext({ role: 'seller' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when empty roles array', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const context = createMockContext({ role: 'seller' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has matching role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin-operation']);
    const context = createMockContext({ role: 'admin-operation' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has one of multiple required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([
      'admin-operation',
      'admin-manager',
    ]);
    const context = createMockContext({ role: 'admin-manager' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user role does not match', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin-operation']);
    const context = createMockContext({ role: 'seller' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny access when no user on request', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin-operation']);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
