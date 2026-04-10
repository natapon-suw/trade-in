import { DefectChecklistService } from './defect-checklist.service';
import { NotFoundException } from '../../../shared/errors';
import { ProductCategory } from '@prisma/client';

describe('DefectChecklistService', () => {
  let service: DefectChecklistService;
  let prisma: {
    defectChecklist: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    defectItem: {
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      defectChecklist: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      defectItem: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    service = new DefectChecklistService(prisma as any);
  });

  describe('findByCategory', () => {
    it('should return active checklists with items for a category', async () => {
      const checklists = [
        {
          id: 'checklist-1',
          category: ProductCategory.LAPTOP,
          name: 'Laptop Defects',
          isActive: true,
          items: [
            { id: 'item-1', defectChecklistId: 'checklist-1', name: 'Screen scratch', description: null, defaultSeverity: 2 },
            { id: 'item-2', defectChecklistId: 'checklist-1', name: 'Dent on body', description: 'Visible dent', defaultSeverity: 3 },
          ],
        },
      ];
      prisma.defectChecklist.findMany.mockResolvedValue(checklists);

      const result = await service.findByCategory(ProductCategory.LAPTOP);

      expect(result).toEqual({ data: checklists });
      expect(prisma.defectChecklist.findMany).toHaveBeenCalledWith({
        where: { category: ProductCategory.LAPTOP, isActive: true },
        include: { items: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create a checklist with nested items', async () => {
      const dto = {
        category: ProductCategory.LAPTOP,
        name: 'Laptop Defects',
        items: [
          { name: 'Screen scratch', defaultSeverity: 2 },
          { name: 'Dent on body', description: 'Visible dent', defaultSeverity: 3 },
        ],
      };
      const created = {
        id: 'checklist-1',
        ...dto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          { id: 'item-1', defectChecklistId: 'checklist-1', name: 'Screen scratch', description: null, defaultSeverity: 2 },
          { id: 'item-2', defectChecklistId: 'checklist-1', name: 'Dent on body', description: 'Visible dent', defaultSeverity: 3 },
        ],
      };

      prisma.defectChecklist.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(prisma.defectChecklist.create).toHaveBeenCalledWith({
        data: {
          category: ProductCategory.LAPTOP,
          name: 'Laptop Defects',
          items: { create: dto.items },
        },
        include: { items: true },
      });
    });
  });

  describe('update', () => {
    const existingChecklist = {
      id: 'checklist-1',
      category: ProductCategory.LAPTOP,
      name: 'Laptop Defects',
      isActive: true,
      items: [
        { id: 'item-1', defectChecklistId: 'checklist-1', name: 'Screen scratch', description: null, defaultSeverity: 2 },
      ],
    };

    it('should update checklist fields without replacing items', async () => {
      const dto = { name: 'Updated Checklist Name' };
      const updated = { ...existingChecklist, name: 'Updated Checklist Name' };

      prisma.defectChecklist.findUnique.mockResolvedValue(existingChecklist);
      prisma.defectChecklist.update.mockResolvedValue(updated);

      const result = await service.update('checklist-1', dto);

      expect(result).toEqual(updated);
      expect(prisma.defectChecklist.update).toHaveBeenCalledWith({
        where: { id: 'checklist-1' },
        data: { name: 'Updated Checklist Name' },
        include: { items: true },
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should replace items when items are provided', async () => {
      const newItems = [
        { name: 'New Defect 1', defaultSeverity: 1 },
        { name: 'New Defect 2', description: 'A new defect', defaultSeverity: 4 },
      ];
      const dto = { name: 'Updated Checklist', items: newItems };
      const updated = {
        ...existingChecklist,
        name: 'Updated Checklist',
        items: [
          { id: 'item-new-1', defectChecklistId: 'checklist-1', name: 'New Defect 1', description: null, defaultSeverity: 1 },
          { id: 'item-new-2', defectChecklistId: 'checklist-1', name: 'New Defect 2', description: 'A new defect', defaultSeverity: 4 },
        ],
      };

      prisma.defectChecklist.findUnique.mockResolvedValue(existingChecklist);
      prisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          defectItem: { deleteMany: prisma.defectItem.deleteMany },
          defectChecklist: { update: prisma.defectChecklist.update },
        };
        prisma.defectItem.deleteMany.mockResolvedValue({ count: 1 });
        prisma.defectChecklist.update.mockResolvedValue(updated);
        return fn(tx);
      });

      const result = await service.update('checklist-1', dto);

      expect(result).toEqual(updated);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.defectItem.deleteMany).toHaveBeenCalledWith({
        where: { defectChecklistId: 'checklist-1' },
      });
      expect(prisma.defectChecklist.update).toHaveBeenCalledWith({
        where: { id: 'checklist-1' },
        data: {
          name: 'Updated Checklist',
          items: { create: newItems },
        },
        include: { items: true },
      });
    });

    it('should throw NotFoundException when checklist does not exist', async () => {
      prisma.defectChecklist.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return checklist with items when found', async () => {
      const checklist = {
        id: 'checklist-1',
        category: ProductCategory.LAPTOP,
        name: 'Laptop Defects',
        isActive: true,
        items: [
          { id: 'item-1', defectChecklistId: 'checklist-1', name: 'Screen scratch', description: null, defaultSeverity: 2 },
        ],
      };
      prisma.defectChecklist.findUnique.mockResolvedValue(checklist);

      const result = await service.findById('checklist-1');

      expect(result).toEqual(checklist);
      expect(prisma.defectChecklist.findUnique).toHaveBeenCalledWith({
        where: { id: 'checklist-1' },
        include: { items: true },
      });
    });

    it('should throw NotFoundException when checklist not found', async () => {
      prisma.defectChecklist.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
