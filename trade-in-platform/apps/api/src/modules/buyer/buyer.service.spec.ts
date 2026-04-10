import { BuyerService } from './buyer.service';
import { NotFoundException } from '../../shared/errors';

describe('BuyerService', () => {
  let service: BuyerService;
  let prisma: {
    stockItem: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      stockItem: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    service = new BuyerService(prisma as any);
  });

  const mockStockItem = (overrides = {}) => ({
    id: 'stock-1',
    assessmentId: 'assess-1',
    productModelId: 'model-1',
    price: 500,
    conditionGrade: 'B+',
    status: 'AVAILABLE',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    productModel: {
      id: 'model-1',
      brand: 'Apple',
      name: 'MacBook Pro 14',
      category: 'MACBOOK',
      basePrice: 1000,
      isActive: true,
    },
    assessment: {
      id: 'assess-1',
      photos: [
        { id: 'photo-1', filename: 'front.jpg', assessmentId: 'assess-1' },
      ],
      testResults: [
        { id: 'tr-1', passed: true },
        { id: 'tr-2', passed: true },
        { id: 'tr-3', passed: false },
      ],
      defects: [
        { id: 'd-1', severity: 2 },
        { id: 'd-2', severity: 4 },
      ],
    },
    ...overrides,
  });

  describe('listProducts', () => {
    it('should return paginated AVAILABLE items', async () => {
      const items = [mockStockItem()];
      prisma.stockItem.findMany.mockResolvedValue(items);
      prisma.stockItem.count.mockResolvedValue(1);

      const result = await service.listProducts(undefined, 1, 20);

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: 'stock-1',
        brand: 'Apple',
        model: 'MacBook Pro 14',
        category: 'MACBOOK',
        price: 500,
        conditionGrade: 'B+',
        photoUrl: '/uploads/assess-1/front.jpg',
        createdAt: '2024-01-15T10:00:00.000Z',
      });

      // Verify only AVAILABLE status is queried
      expect(prisma.stockItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'AVAILABLE' },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should filter by category', async () => {
      prisma.stockItem.findMany.mockResolvedValue([]);
      prisma.stockItem.count.mockResolvedValue(0);

      await service.listProducts('LAPTOP' as any, 1, 10);

      expect(prisma.stockItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'AVAILABLE',
            productModel: { category: 'LAPTOP' },
          },
        }),
      );
    });

    it('should handle items with no photos', async () => {
      const item = mockStockItem({
        assessment: { id: 'assess-1', photos: [], testResults: [], defects: [] },
      });
      prisma.stockItem.findMany.mockResolvedValue([item]);
      prisma.stockItem.count.mockResolvedValue(1);

      const result = await service.listProducts();

      expect(result.data[0].photoUrl).toBeNull();
    });

    it('should paginate correctly', async () => {
      prisma.stockItem.findMany.mockResolvedValue([]);
      prisma.stockItem.count.mockResolvedValue(50);

      const result = await service.listProducts(undefined, 3, 10);

      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(10);
      expect(prisma.stockItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  describe('getProductDetail', () => {
    it('should return full product details', async () => {
      prisma.stockItem.findUnique.mockResolvedValue(mockStockItem());

      const result = await service.getProductDetail('stock-1');

      expect(result).toEqual({
        id: 'stock-1',
        brand: 'Apple',
        model: 'MacBook Pro 14',
        category: 'MACBOOK',
        price: 500,
        conditionGrade: 'B+',
        photos: [{ id: 'photo-1', url: '/uploads/assess-1/front.jpg' }],
        testSummary: { passed: 2, failed: 1 },
        defectSummary: { count: 2, averageSeverity: 3 },
        createdAt: '2024-01-15T10:00:00.000Z',
      });
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.stockItem.findUnique.mockResolvedValue(null);

      await expect(service.getProductDetail('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for non-AVAILABLE item', async () => {
      prisma.stockItem.findUnique.mockResolvedValue(
        mockStockItem({ status: 'SOLD' }),
      );

      await expect(service.getProductDetail('stock-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle product with no defects or test results', async () => {
      const item = mockStockItem({
        assessment: { id: 'assess-1', photos: [], testResults: [], defects: [] },
      });
      prisma.stockItem.findUnique.mockResolvedValue(item);

      const result = await service.getProductDetail('stock-1');

      expect(result.photos).toEqual([]);
      expect(result.testSummary).toEqual({ passed: 0, failed: 0 });
      expect(result.defectSummary).toEqual({ count: 0, averageSeverity: 0 });
    });
  });
});
