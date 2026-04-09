import { CustomerService } from './customer.service';
import { ConflictException, NotFoundException } from '../../../shared/errors';

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: {
    customer: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      customer: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    service = new CustomerService(prisma as any);
  });

  describe('search', () => {
    it('should return matching customers by name or phone', async () => {
      const customers = [
        { id: '1', name: 'John Doe', phone: '0812345678', email: null },
      ];
      prisma.customer.findMany.mockResolvedValue(customers);
      prisma.customer.count.mockResolvedValue(1);

      const result = await service.search('John');

      expect(result).toEqual({ data: customers, total: 1 });
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: 'John' } },
            { phone: { contains: 'John' } },
          ],
        },
      });
    });

    it('should return all non-deleted customers when no query provided', async () => {
      const customers = [
        { id: '1', name: 'John', phone: '0811111111', email: null },
        { id: '2', name: 'Jane', phone: '0822222222', email: null },
      ];
      prisma.customer.findMany.mockResolvedValue(customers);
      prisma.customer.count.mockResolvedValue(2);

      const result = await service.search();

      expect(result).toEqual({ data: customers, total: 2 });
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });
  });

  describe('create', () => {
    it('should create a customer with valid data', async () => {
      const dto = { name: 'John Doe', phone: '0812345678' };
      const created = { id: 'uuid-1', ...dto, email: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };

      prisma.customer.findUnique.mockResolvedValue(null);
      prisma.customer.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(prisma.customer.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw ConflictException for duplicate phone', async () => {
      const dto = { name: 'John Doe', phone: '0812345678' };
      prisma.customer.findUnique.mockResolvedValue({ id: 'existing', phone: dto.phone });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(prisma.customer.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return customer when found', async () => {
      const customer = { id: 'uuid-1', name: 'John', phone: '0812345678', email: null, deletedAt: null };
      prisma.customer.findFirst.mockResolvedValue(customer);

      const result = await service.findById('uuid-1');

      expect(result).toEqual(customer);
      expect(prisma.customer.findFirst).toHaveBeenCalledWith({
        where: { id: 'uuid-1', deletedAt: null },
      });
    });

    it('should throw NotFoundException when customer not found', async () => {
      prisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
