import { TestGuideService } from './test-guide.service';
import { NotFoundException } from '../../../shared/errors';
import { ProductCategory } from '@prisma/client';

describe('TestGuideService', () => {
  let service: TestGuideService;
  let prisma: {
    testGuide: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    testStep: {
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      testGuide: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      testStep: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    service = new TestGuideService(prisma as any);
  });

  describe('findByCategory', () => {
    it('should return active guides with steps for a category', async () => {
      const guides = [
        {
          id: 'guide-1',
          category: ProductCategory.LAPTOP,
          name: 'Laptop Test Guide',
          isActive: true,
          steps: [
            { id: 'step-1', testGuideId: 'guide-1', stepNumber: 1, title: 'Power On', description: null },
            { id: 'step-2', testGuideId: 'guide-1', stepNumber: 2, title: 'Check Screen', description: 'Verify display' },
          ],
        },
      ];
      prisma.testGuide.findMany.mockResolvedValue(guides);

      const result = await service.findByCategory(ProductCategory.LAPTOP);

      expect(result).toEqual({ data: guides });
      expect(prisma.testGuide.findMany).toHaveBeenCalledWith({
        where: { category: ProductCategory.LAPTOP, isActive: true },
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create a guide with nested steps', async () => {
      const dto = {
        category: ProductCategory.LAPTOP,
        name: 'Laptop Test Guide',
        steps: [
          { stepNumber: 1, title: 'Power On' },
          { stepNumber: 2, title: 'Check Screen', description: 'Verify display works' },
        ],
      };
      const created = {
        id: 'guide-1',
        ...dto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          { id: 'step-1', testGuideId: 'guide-1', stepNumber: 1, title: 'Power On', description: null },
          { id: 'step-2', testGuideId: 'guide-1', stepNumber: 2, title: 'Check Screen', description: 'Verify display works' },
        ],
      };

      prisma.testGuide.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(prisma.testGuide.create).toHaveBeenCalledWith({
        data: {
          category: ProductCategory.LAPTOP,
          name: 'Laptop Test Guide',
          steps: { create: dto.steps },
        },
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });
    });
  });

  describe('update', () => {
    const existingGuide = {
      id: 'guide-1',
      category: ProductCategory.LAPTOP,
      name: 'Laptop Test Guide',
      isActive: true,
      steps: [
        { id: 'step-1', testGuideId: 'guide-1', stepNumber: 1, title: 'Power On', description: null },
      ],
    };

    it('should update guide fields without replacing steps', async () => {
      const dto = { name: 'Updated Guide Name' };
      const updated = { ...existingGuide, name: 'Updated Guide Name' };

      prisma.testGuide.findUnique.mockResolvedValue(existingGuide);
      prisma.testGuide.update.mockResolvedValue(updated);

      const result = await service.update('guide-1', dto);

      expect(result).toEqual(updated);
      expect(prisma.testGuide.update).toHaveBeenCalledWith({
        where: { id: 'guide-1' },
        data: { name: 'Updated Guide Name' },
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should replace steps when steps are provided', async () => {
      const newSteps = [
        { stepNumber: 1, title: 'New Step 1' },
        { stepNumber: 2, title: 'New Step 2' },
      ];
      const dto = { name: 'Updated Guide', steps: newSteps };
      const updated = {
        ...existingGuide,
        name: 'Updated Guide',
        steps: [
          { id: 'step-new-1', testGuideId: 'guide-1', stepNumber: 1, title: 'New Step 1', description: null },
          { id: 'step-new-2', testGuideId: 'guide-1', stepNumber: 2, title: 'New Step 2', description: null },
        ],
      };

      prisma.testGuide.findUnique.mockResolvedValue(existingGuide);
      prisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          testStep: { deleteMany: prisma.testStep.deleteMany },
          testGuide: { update: prisma.testGuide.update },
        };
        prisma.testStep.deleteMany.mockResolvedValue({ count: 1 });
        prisma.testGuide.update.mockResolvedValue(updated);
        return fn(tx);
      });

      const result = await service.update('guide-1', dto);

      expect(result).toEqual(updated);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.testStep.deleteMany).toHaveBeenCalledWith({
        where: { testGuideId: 'guide-1' },
      });
      expect(prisma.testGuide.update).toHaveBeenCalledWith({
        where: { id: 'guide-1' },
        data: {
          name: 'Updated Guide',
          steps: { create: newSteps },
        },
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });
    });

    it('should throw NotFoundException when guide does not exist', async () => {
      prisma.testGuide.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return guide with steps when found', async () => {
      const guide = {
        id: 'guide-1',
        category: ProductCategory.LAPTOP,
        name: 'Laptop Test Guide',
        isActive: true,
        steps: [
          { id: 'step-1', testGuideId: 'guide-1', stepNumber: 1, title: 'Power On', description: null },
        ],
      };
      prisma.testGuide.findUnique.mockResolvedValue(guide);

      const result = await service.findById('guide-1');

      expect(result).toEqual(guide);
      expect(prisma.testGuide.findUnique).toHaveBeenCalledWith({
        where: { id: 'guide-1' },
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });
    });

    it('should throw NotFoundException when guide not found', async () => {
      prisma.testGuide.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
