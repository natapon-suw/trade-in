import { SellerPriceCheckService } from './seller-price-check.service';
import { NotFoundException } from '../../shared/errors';

describe('SellerPriceCheckService', () => {
  let service: SellerPriceCheckService;
  let prisma: {
    productModel: { findUnique: jest.Mock; findMany: jest.Mock };
    pricingRule: { findMany: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      productModel: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      pricingRule: {
        findMany: jest.fn(),
      },
    };
    service = new SellerPriceCheckService(prisma as any);
  });

  describe('checkPrice', () => {
    const mockModel = {
      id: 'model-1',
      brand: 'Apple',
      name: 'MacBook Pro 14',
      category: 'MACBOOK',
      basePrice: 1000,
      isActive: true,
    };

    it('should return estimated range with no defects (base price only)', async () => {
      prisma.productModel.findUnique.mockResolvedValue(mockModel);
      prisma.pricingRule.findMany.mockResolvedValue([]);

      const result = await service.checkPrice({
        productModelId: 'model-1',
        defects: [],
      });

      expect(result.basePrice).toBe(1000);
      expect(result.deductions).toBe(0);
      expect(result.finalEstimate).toBe(1000);
      expect(result.estimatedMin).toBe(900);
      expect(result.estimatedMax).toBe(1100);
    });

    it('should apply defect-based deductions', async () => {
      prisma.productModel.findUnique.mockResolvedValue(mockModel);
      prisma.pricingRule.findMany.mockResolvedValue([
        {
          id: 'rule-1',
          conditionType: 'DEFECT_COUNT',
          conditionOperator: 'GTE',
          conditionValue: 1,
          adjustmentType: 'PERCENTAGE',
          adjustmentValue: -10,
          priority: 1,
          isActive: true,
        },
      ]);

      const result = await service.checkPrice({
        productModelId: 'model-1',
        defects: [{ defectItemId: 'd1', severity: 3 }],
      });

      // -10% of 1000 = -100 deduction
      expect(result.basePrice).toBe(1000);
      expect(result.deductions).toBe(-100);
      expect(result.finalEstimate).toBe(900);
      expect(result.estimatedMin).toBe(810);
      expect(result.estimatedMax).toBe(990);
    });

    it('should apply severity-based deductions', async () => {
      prisma.productModel.findUnique.mockResolvedValue(mockModel);
      prisma.pricingRule.findMany.mockResolvedValue([
        {
          id: 'rule-2',
          conditionType: 'DEFECT_SEVERITY',
          conditionOperator: 'GT',
          conditionValue: 3,
          adjustmentType: 'FIXED',
          adjustmentValue: -200,
          priority: 1,
          isActive: true,
        },
      ]);

      const result = await service.checkPrice({
        productModelId: 'model-1',
        defects: [
          { defectItemId: 'd1', severity: 5 },
          { defectItemId: 'd2', severity: 4 },
        ],
      });

      // avg severity = 4.5, > 3 → fixed -200
      expect(result.basePrice).toBe(1000);
      expect(result.deductions).toBe(-200);
      expect(result.finalEstimate).toBe(800);
    });

    it('should not go below zero for final estimate', async () => {
      prisma.productModel.findUnique.mockResolvedValue(mockModel);
      prisma.pricingRule.findMany.mockResolvedValue([
        {
          id: 'rule-3',
          conditionType: 'DEFECT_COUNT',
          conditionOperator: 'GTE',
          conditionValue: 1,
          adjustmentType: 'FIXED',
          adjustmentValue: -2000,
          priority: 1,
          isActive: true,
        },
      ]);

      const result = await service.checkPrice({
        productModelId: 'model-1',
        defects: [{ defectItemId: 'd1', severity: 5 }],
      });

      expect(result.finalEstimate).toBe(0);
      expect(result.estimatedMin).toBe(0);
      expect(result.estimatedMax).toBe(0);
    });

    it('should throw NotFoundException if product model not found', async () => {
      prisma.productModel.findUnique.mockResolvedValue(null);

      await expect(
        service.checkPrice({ productModelId: 'missing', defects: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchModels', () => {
    it('should return matching models by query', async () => {
      const models = [
        { id: '1', brand: 'Apple', name: 'MacBook Pro', category: 'MACBOOK', basePrice: 1000, isActive: true },
      ];
      prisma.productModel.findMany.mockResolvedValue(models);

      const result = await service.searchModels('MacBook');

      expect(prisma.productModel.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [{ name: { contains: 'MacBook' } }, { brand: { contains: 'MacBook' } }],
        },
      });
      expect(result).toEqual(models);
    });

    it('should return all active models when no query provided', async () => {
      const models = [
        { id: '1', brand: 'Apple', name: 'MacBook Pro', isActive: true },
        { id: '2', brand: 'Dell', name: 'XPS 15', isActive: true },
      ];
      prisma.productModel.findMany.mockResolvedValue(models);

      const result = await service.searchModels();

      expect(prisma.productModel.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toEqual(models);
    });
  });
});
