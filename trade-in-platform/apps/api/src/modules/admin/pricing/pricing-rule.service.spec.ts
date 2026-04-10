import { PricingRuleService } from './pricing-rule.service';
import { NotFoundException } from '../../../shared/errors';
import {
  AdjustmentType,
  ConditionOperator,
  ConditionType,
  ProductCategory,
} from '@prisma/client';

describe('PricingRuleService', () => {
  let service: PricingRuleService;
  let prisma: {
    pricingRule: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      pricingRule: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new PricingRuleService(prisma as any);
  });

  describe('findAll', () => {
    it('should return active rules ordered by priority DESC', async () => {
      const rules = [
        { id: '1', name: 'High priority', priority: 10, isActive: true },
        { id: '2', name: 'Low priority', priority: 1, isActive: true },
      ];
      prisma.pricingRule.findMany.mockResolvedValue(rules);

      const result = await service.findAll();

      expect(result).toEqual(rules);
      expect(prisma.pricingRule.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a pricing rule', async () => {
      const dto = {
        name: 'Defect deduction',
        conditionType: ConditionType.DEFECT_COUNT,
        conditionOperator: ConditionOperator.GT,
        conditionValue: 3,
        adjustmentType: AdjustmentType.PERCENTAGE,
        adjustmentValue: -10,
        priority: 5,
      };
      const created = {
        id: 'uuid-1',
        ...dto,
        category: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.pricingRule.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(prisma.pricingRule.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('update', () => {
    it('should update a pricing rule when it exists', async () => {
      const existing = {
        id: 'uuid-1',
        name: 'Old name',
        conditionType: ConditionType.DEFECT_COUNT,
        conditionOperator: ConditionOperator.GT,
        conditionValue: 3,
        adjustmentType: AdjustmentType.PERCENTAGE,
        adjustmentValue: -10,
        priority: 5,
        category: null,
        isActive: true,
      };
      const dto = { name: 'Updated name' };
      const updated = { ...existing, ...dto };

      prisma.pricingRule.findUnique.mockResolvedValue(existing);
      prisma.pricingRule.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', dto);

      expect(result).toEqual(updated);
      expect(prisma.pricingRule.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: dto,
      });
    });

    it('should throw NotFoundException when rule does not exist', async () => {
      prisma.pricingRule.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'test' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.pricingRule.update).not.toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    it('should set isActive to false', async () => {
      const existing = {
        id: 'uuid-1',
        name: 'Rule',
        isActive: true,
      };
      const deactivated = { ...existing, isActive: false };

      prisma.pricingRule.findUnique.mockResolvedValue(existing);
      prisma.pricingRule.update.mockResolvedValue(deactivated);

      const result = await service.deactivate('uuid-1');

      expect(result).toEqual(deactivated);
      expect(result.isActive).toBe(false);
      expect(prisma.pricingRule.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException when rule does not exist', async () => {
      prisma.pricingRule.findUnique.mockResolvedValue(null);

      await expect(service.deactivate('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.pricingRule.update).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return rule when found', async () => {
      const rule = {
        id: 'uuid-1',
        name: 'Test rule',
        category: ProductCategory.LAPTOP,
        conditionType: ConditionType.TEST_PASS_RATE,
        conditionOperator: ConditionOperator.LT,
        conditionValue: 80,
        adjustmentType: AdjustmentType.FIXED,
        adjustmentValue: -50,
        priority: 1,
        isActive: true,
      };
      prisma.pricingRule.findUnique.mockResolvedValue(rule);

      const result = await service.findById('uuid-1');

      expect(result).toEqual(rule);
      expect(prisma.pricingRule.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
    });

    it('should throw NotFoundException when rule not found', async () => {
      prisma.pricingRule.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
