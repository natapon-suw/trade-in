import { ProductModelService } from './product-model.service';
import { NotFoundException } from '../../../shared/errors';
import { ProductCategory } from '@prisma/client';

describe('ProductModelService', () => {
  let service: ProductModelService;
  let prisma: {
    productModel: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      productModel: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new ProductModelService(prisma as any);
  });

  describe('search', () => {
    it('should return matching models by name or brand', async () => {
      const models = [
        { id: '1', brand: 'Apple', name: 'MacBook Pro 14"', category: ProductCategory.MACBOOK, basePrice: 1500, isActive: true },
      ];
      prisma.productModel.findMany.mockResolvedValue(models);
      prisma.productModel.count.mockResolvedValue(1);

      const result = await service.search('MacBook');

      expect(result).toEqual({ data: models, total: 1 });
      expect(prisma.productModel.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { name: { contains: 'MacBook' } },
            { brand: { contains: 'MacBook' } },
          ],
        },
      });
    });

    it('should filter by category', async () => {
      const models = [
        { id: '1', brand: 'Dell', name: 'XPS 15', category: ProductCategory.LAPTOP, basePrice: 800, isActive: true },
      ];
      prisma.productModel.findMany.mockResolvedValue(models);
      prisma.productModel.count.mockResolvedValue(1);

      const result = await service.search(undefined, ProductCategory.LAPTOP);

      expect(result).toEqual({ data: models, total: 1 });
      expect(prisma.productModel.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          category: ProductCategory.LAPTOP,
        },
      });
    });

    it('should return all active models when no filters provided', async () => {
      const models = [
        { id: '1', brand: 'Apple', name: 'MacBook Pro', category: ProductCategory.MACBOOK, basePrice: 1500, isActive: true },
        { id: '2', brand: 'Dell', name: 'XPS 15', category: ProductCategory.LAPTOP, basePrice: 800, isActive: true },
      ];
      prisma.productModel.findMany.mockResolvedValue(models);
      prisma.productModel.count.mockResolvedValue(2);

      const result = await service.search();

      expect(result).toEqual({ data: models, total: 2 });
      expect(prisma.productModel.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });
  });

  describe('create', () => {
    it('should create a product model with valid data', async () => {
      const dto = { brand: 'Apple', name: 'MacBook Air M2', category: ProductCategory.MACBOOK, basePrice: 1200 };
      const created = { id: 'uuid-1', ...dto, isActive: true, createdAt: new Date(), updatedAt: new Date() };

      prisma.productModel.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(prisma.productModel.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('update', () => {
    it('should update a product model when it exists', async () => {
      const existing = { id: 'uuid-1', brand: 'Apple', name: 'MacBook Pro', category: ProductCategory.MACBOOK, basePrice: 1500, isActive: true };
      const dto = { basePrice: 1600 };
      const updated = { ...existing, ...dto };

      prisma.productModel.findUnique.mockResolvedValue(existing);
      prisma.productModel.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', dto);

      expect(result).toEqual(updated);
      expect(prisma.productModel.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: dto,
      });
    });

    it('should throw NotFoundException when model does not exist', async () => {
      prisma.productModel.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { basePrice: 100 })).rejects.toThrow(NotFoundException);
      expect(prisma.productModel.update).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return model when found', async () => {
      const model = { id: 'uuid-1', brand: 'HP', name: 'EliteBook', category: ProductCategory.LAPTOP, basePrice: 600, isActive: true };
      prisma.productModel.findUnique.mockResolvedValue(model);

      const result = await service.findById('uuid-1');

      expect(result).toEqual(model);
      expect(prisma.productModel.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
    });

    it('should throw NotFoundException when model not found', async () => {
      prisma.productModel.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
