import { AssessmentStatus, StockStatus } from '@prisma/client';

import {
  NotFoundException,
  ValidationException,
} from '../../../shared/errors';
import { StockService } from './stock.service';

describe('StockService', () => {
  let service: StockService;
  let prisma: {
    assessment: { findUnique: jest.Mock; update: jest.Mock };
    stockItem: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockProductModel = {
    id: 'model-1',
    brand: 'Apple',
    name: 'MacBook Pro 14"',
    category: 'MACBOOK',
    basePrice: 1000,
    isActive: true,
  };

  const mockAssessment = {
    id: 'assess-1',
    customerId: 'cust-1',
    productModelId: 'model-1',
    assessedById: 'user-1',
    status: AssessmentStatus.PRICED,
    finalPrice: 800,
    productModel: mockProductModel,
    defects: [{ severity: 2 }, { severity: 3 }],
    stockItem: null,
  };

  const mockStockItem = {
    id: 'stock-1',
    assessmentId: 'assess-1',
    productModelId: 'model-1',
    price: 800,
    conditionGrade: 'B',
    status: StockStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
    productModel: mockProductModel,
  };

  beforeEach(() => {
    prisma = {
      assessment: { findUnique: jest.fn(), update: jest.fn() },
      stockItem: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    service = new StockService(prisma as any);
  });

  describe('addToStock', () => {
    it('should create stock item with correct grade and price from PRICED assessment', async () => {
      prisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      prisma.$transaction.mockResolvedValue([mockStockItem, {}]);

      const result = await service.addToStock('assess-1');

      expect(result).toEqual(mockStockItem);
      expect(prisma.assessment.findUnique).toHaveBeenCalledWith({
        where: { id: 'assess-1' },
        include: {
          defects: true,
          productModel: true,
          stockItem: true,
        },
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when assessment does not exist', async () => {
      prisma.assessment.findUnique.mockResolvedValue(null);

      await expect(service.addToStock('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ValidationException when assessment status is not PRICED', async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        ...mockAssessment,
        status: AssessmentStatus.DEFECTS_GRADED,
      });

      await expect(service.addToStock('assess-1')).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException when assessment already has a stock item', async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        ...mockAssessment,
        stockItem: mockStockItem,
      });

      await expect(service.addToStock('assess-1')).rejects.toThrow(
        ValidationException,
      );
    });

    it('should compute grade A for assessment with no defects', async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        ...mockAssessment,
        defects: [],
      });
      const gradeAStockItem = { ...mockStockItem, conditionGrade: 'A' };
      prisma.$transaction.mockResolvedValue([gradeAStockItem, {}]);

      const result = await service.addToStock('assess-1');

      expect(result.conditionGrade).toBe('A');
    });
  });

  describe('findAll', () => {
    it('should return paginated results with defaults', async () => {
      prisma.stockItem.findMany.mockResolvedValue([mockStockItem]);
      prisma.stockItem.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: [mockStockItem],
        total: 1,
        page: 1,
        pageSize: 20,
      });
      expect(prisma.stockItem.findMany).toHaveBeenCalledWith({
        where: {},
        include: { productModel: true },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should apply category filter', async () => {
      prisma.stockItem.findMany.mockResolvedValue([]);
      prisma.stockItem.count.mockResolvedValue(0);

      await service.findAll({ category: 'MACBOOK' as any });

      expect(prisma.stockItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productModel: { category: 'MACBOOK' } },
        }),
      );
    });

    it('should apply status filter', async () => {
      prisma.stockItem.findMany.mockResolvedValue([]);
      prisma.stockItem.count.mockResolvedValue(0);

      await service.findAll({ status: StockStatus.AVAILABLE });

      expect(prisma.stockItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: StockStatus.AVAILABLE },
        }),
      );
    });

    it('should apply date range filters', async () => {
      prisma.stockItem.findMany.mockResolvedValue([]);
      prisma.stockItem.count.mockResolvedValue(0);

      await service.findAll({
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      });

      expect(prisma.stockItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            createdAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-12-31'),
            },
          },
        }),
      );
    });

    it('should apply price range filters', async () => {
      prisma.stockItem.findMany.mockResolvedValue([]);
      prisma.stockItem.count.mockResolvedValue(0);

      await service.findAll({ priceMin: 100, priceMax: 500 });

      expect(prisma.stockItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { price: { gte: 100, lte: 500 } },
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      prisma.stockItem.findMany.mockResolvedValue([]);
      prisma.stockItem.count.mockResolvedValue(50);

      const result = await service.findAll({ page: 3, pageSize: 10 });

      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(10);
      expect(prisma.stockItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return stock item with full assessment details', async () => {
      const fullStockItem = {
        ...mockStockItem,
        assessment: {
          ...mockAssessment,
          photos: [],
          testResults: [],
          defects: [],
        },
      };
      prisma.stockItem.findUnique.mockResolvedValue(fullStockItem);

      const result = await service.findById('stock-1');

      expect(result).toEqual(fullStockItem);
      expect(prisma.stockItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        include: {
          productModel: true,
          assessment: {
            include: {
              photos: true,
              testResults: { include: { testStep: true } },
              defects: { include: { defectItem: true } },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when stock item not found', async () => {
      prisma.stockItem.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
