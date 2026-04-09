jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  UserRole: {
    ADMIN_OPERATION: 'ADMIN_OPERATION',
    ADMIN_MANAGER: 'ADMIN_MANAGER',
    SELLER: 'SELLER',
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password: string) =>
    Promise.resolve(`hashed_${password}`),
  ),
}));

import { seed } from './seed';

describe('seed', () => {
  let mockPrisma: { user: { upsert: jest.Mock } };

  beforeEach(() => {
    mockPrisma = {
      user: {
        upsert: jest.fn().mockImplementation(({ create }) =>
          Promise.resolve({
            id: `uuid-${create.email}`,
            email: create.email,
            name: create.name,
            role: create.role,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          }),
        ),
      },
    };
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should upsert exactly 3 users', async () => {
    await seed(mockPrisma as any);
    expect(mockPrisma.user.upsert).toHaveBeenCalledTimes(3);
  });

  it('should seed Admin Operation user with correct data', async () => {
    await seed(mockPrisma as any);

    const firstCall = mockPrisma.user.upsert.mock.calls[0][0];
    expect(firstCall.where).toEqual({ email: 'admin@tradein.local' });
    expect(firstCall.create).toMatchObject({
      email: 'admin@tradein.local',
      name: 'Admin Operation',
      role: 'ADMIN_OPERATION',
      passwordHash: 'hashed_Admin123!',
    });
  });

  it('should seed Admin Manager user with correct data', async () => {
    await seed(mockPrisma as any);

    const secondCall = mockPrisma.user.upsert.mock.calls[1][0];
    expect(secondCall.where).toEqual({ email: 'manager@tradein.local' });
    expect(secondCall.create).toMatchObject({
      email: 'manager@tradein.local',
      name: 'Admin Manager',
      role: 'ADMIN_MANAGER',
      passwordHash: 'hashed_Manager123!',
    });
  });

  it('should seed Test Seller user with correct data', async () => {
    await seed(mockPrisma as any);

    const thirdCall = mockPrisma.user.upsert.mock.calls[2][0];
    expect(thirdCall.where).toEqual({ email: 'seller@tradein.local' });
    expect(thirdCall.create).toMatchObject({
      email: 'seller@tradein.local',
      name: 'Test Seller',
      role: 'SELLER',
      passwordHash: 'hashed_Seller123!',
    });
  });

  it('should use hashed passwords (not plaintext)', async () => {
    await seed(mockPrisma as any);

    for (const call of mockPrisma.user.upsert.mock.calls) {
      const { passwordHash } = call[0].create;
      expect(passwordHash).toMatch(/^hashed_/);
    }
  });

  it('should be idempotent via upsert (update block present)', async () => {
    await seed(mockPrisma as any);

    for (const call of mockPrisma.user.upsert.mock.calls) {
      expect(call[0]).toHaveProperty('update');
      expect(call[0]).toHaveProperty('create');
      expect(call[0]).toHaveProperty('where');
    }
  });
});
