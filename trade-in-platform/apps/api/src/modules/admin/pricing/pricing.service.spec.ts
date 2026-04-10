import {
  AdjustmentType,
  ConditionOperator,
  ConditionType,
  ProductCategory,
} from '@prisma/client';

import { PricingService } from './pricing.service';
import { NotFoundException } from '../../../shared/errors';

function makeRule(overrides: Record<string, unknown> = {}) {
  return {
    id: 'rule-1',
    name: 'Test rule',
    category: null,
    conditionType: ConditionType.DEFECT_COUNT,
    conditionOperator: ConditionOperator.GT,
    conditionValue: 0,
    adjustmentType: AdjustmentType.PERCENTAGE,
    adjustmentValue: -10,
    priority: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeAssessment(overrides: Record<string, unknown> = {}) {
  return {
    id: 'assess-1',
    customerId: 'cust-1',
    productModelId: 'model-1',
    assessedById: 'user-1',
    status: 'DEFECTS_GRADED',
    finalPrice: null,
    priceOverrideReason: null,
    priceOverrideById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    productModel: {
      id: 'model-1',
      brand: 'Apple',
      name: 'MacBook Pro',
      category: ProductCategory.MACBOOK,
      basePrice: 1000,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    testResults: [
      { id: 'tr-1', assessmentId: 'assess-1', testStepId: 'ts-1', passed: true, notes: null, createdAt: new Date() },
      { id: 'tr-2', assessmentId: 'assess-1', testStepId: 'ts-2', passed: false, notes: null, createdAt: new Date() },
    ],
    defects: [
      { id: 'd-1', assessmentId: 'assess-1', defectItemId: 'di-1', severity: 3, notes: null },
      { id: 'd-2', assessmentId: 'assess-1', defectItemId: 'di-2', severity: 5, notes: null },
    ],
    ...overrides,
  };
}

describe('PricingService', () => {
  let service: PricingService;
  let prisma: {
    assessment: { findUnique: jest.Mock };
    pricingRule: { findMany: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      assessment: { findUnique: jest.fn() },
      pricingRule: { findMany: jest.fn() },
    };
    service = new PricingService(prisma as any);
  });

  describe('calculatePrice', () => {
    it('should return base price when no rules exist', async () => {
      prisma.assessment.findUnique.mockResolvedValue(makeAssessment());
      prisma.pricingRule.findMany.mockResolvedValue([]);

      const result = await service.calculatePrice('assess-1');

      expect(result).toEqual({
        basePrice: 1000,
        testDeductions: 0,
        defectDeductions: 0,
        finalPrice: 1000,
      });
    });

    it('should throw NotFoundException when assessment not found', async () => {
      prisma.assessment.findUnique.mockResolvedValue(null);

      await expect(service.calculatePrice('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should apply percentage rule correctly', async () => {
      prisma.assessment.findUnique.mockResolvedValue(makeAssessment());
      // Rule: if defect count > 0, deduct 10% of base price
      prisma.pricingRule.findMany.mockResolvedValue([
        makeRule({
          conditionType: ConditionType.DEFECT_COUNT,
          conditionOperator: ConditionOperator.GT,
          conditionValue: 0,
          adjustmentType: AdjustmentType.PERCENTAGE,
          adjustmentValue: -10,
          priority: 1,
        }),
      ]);

      const result = await service.calculatePrice('assess-1');

      // basePrice=1000, 2 defects > 0 → -10% = -100
      expect(result.defectDeductions).toBe(-100);
      expect(result.finalPrice).toBe(900);
    });

    it('should apply fixed rule correctly', async () => {
      prisma.assessment.findUnique.mockResolvedValue(makeAssessment());
      // Rule: if avg severity > 2, deduct $150 fixed
      prisma.pricingRule.findMany.mockResolvedValue([
        makeRule({
          conditionType: ConditionType.DEFECT_SEVERITY,
          conditionOperator: ConditionOperator.GT,
          conditionValue: 2,
          adjustmentType: AdjustmentType.FIXED,
          adjustmentValue: -150,
          priority: 1,
        }),
      ]);

      const result = await service.calculatePrice('assess-1');

      // avg severity = (3+5)/2 = 4, 4 > 2 → -150
      expect(result.defectDeductions).toBe(-150);
      expect(result.finalPrice).toBe(850);
    });

    it('should apply multiple rules in priority order', async () => {
      prisma.assessment.findUnique.mockResolvedValue(makeAssessment());
      prisma.pricingRule.findMany.mockResolvedValue([
        makeRule({
          id: 'rule-high',
          conditionType: ConditionType.TEST_PASS_RATE,
          conditionOperator: ConditionOperator.LT,
          conditionValue: 100,
          adjustmentType: AdjustmentType.PERCENTAGE,
          adjustmentValue: -5,
          priority: 10,
        }),
        makeRule({
          id: 'rule-low',
          conditionType: ConditionType.DEFECT_COUNT,
          conditionOperator: ConditionOperator.GT,
          conditionValue: 1,
          adjustmentType: AdjustmentType.FIXED,
          adjustmentValue: -50,
          priority: 5,
        }),
      ]);

      const result = await service.calculatePrice('assess-1');

      // test pass rate = 50% < 100 → -5% of 1000 = -50 (testDeductions)
      // defect count = 2 > 1 → -50 fixed (defectDeductions)
      expect(result.testDeductions).toBe(-50);
      expect(result.defectDeductions).toBe(-50);
      expect(result.finalPrice).toBe(900);
    });

    it('should never return negative finalPrice', async () => {
      prisma.assessment.findUnique.mockResolvedValue(makeAssessment());
      prisma.pricingRule.findMany.mockResolvedValue([
        makeRule({
          conditionType: ConditionType.DEFECT_COUNT,
          conditionOperator: ConditionOperator.GT,
          conditionValue: 0,
          adjustmentType: AdjustmentType.FIXED,
          adjustmentValue: -5000,
          priority: 1,
        }),
      ]);

      const result = await service.calculatePrice('assess-1');

      expect(result.finalPrice).toBe(0);
      expect(result.finalPrice).toBeGreaterThanOrEqual(0);
    });

    it('should apply rules with null category to all products', async () => {
      prisma.assessment.findUnique.mockResolvedValue(makeAssessment());
      prisma.pricingRule.findMany.mockResolvedValue([
        makeRule({
          category: null,
          conditionType: ConditionType.DEFECT_COUNT,
          conditionOperator: ConditionOperator.GT,
          conditionValue: 0,
          adjustmentType: AdjustmentType.FIXED,
          adjustmentValue: -25,
          priority: 1,
        }),
      ]);

      const result = await service.calculatePrice('assess-1');

      expect(result.defectDeductions).toBe(-25);
      expect(result.finalPrice).toBe(975);
    });

    it('should separate test deductions from defect deductions', async () => {
      prisma.assessment.findUnique.mockResolvedValue(makeAssessment());
      prisma.pricingRule.findMany.mockResolvedValue([
        makeRule({
          id: 'test-rule',
          conditionType: ConditionType.TEST_PASS_RATE,
          conditionOperator: ConditionOperator.LT,
          conditionValue: 80,
          adjustmentType: AdjustmentType.PERCENTAGE,
          adjustmentValue: -10,
          priority: 2,
        }),
        makeRule({
          id: 'defect-rule',
          conditionType: ConditionType.DEFECT_SEVERITY,
          conditionOperator: ConditionOperator.GT,
          conditionValue: 3,
          adjustmentType: AdjustmentType.FIXED,
          adjustmentValue: -200,
          priority: 1,
        }),
      ]);

      const result = await service.calculatePrice('assess-1');

      // test pass rate = 50% < 80 → -10% of 1000 = -100
      expect(result.testDeductions).toBe(-100);
      // avg severity = 4 > 3 → -200
      expect(result.defectDeductions).toBe(-200);
      expect(result.finalPrice).toBe(700);
    });

    it('should not apply rule when condition is not met', async () => {
      prisma.assessment.findUnique.mockResolvedValue(makeAssessment());
      prisma.pricingRule.findMany.mockResolvedValue([
        makeRule({
          conditionType: ConditionType.DEFECT_COUNT,
          conditionOperator: ConditionOperator.GT,
          conditionValue: 100, // 2 defects is NOT > 100
          adjustmentType: AdjustmentType.FIXED,
          adjustmentValue: -500,
          priority: 1,
        }),
      ]);

      const result = await service.calculatePrice('assess-1');

      expect(result.defectDeductions).toBe(0);
      expect(result.finalPrice).toBe(1000);
    });

    it('should handle assessment with no test results (100% pass rate)', async () => {
      prisma.assessment.findUnique.mockResolvedValue(
        makeAssessment({ testResults: [], defects: [] }),
      );
      prisma.pricingRule.findMany.mockResolvedValue([
        makeRule({
          conditionType: ConditionType.TEST_PASS_RATE,
          conditionOperator: ConditionOperator.LT,
          conditionValue: 100,
          adjustmentType: AdjustmentType.PERCENTAGE,
          adjustmentValue: -10,
          priority: 1,
        }),
      ]);

      const result = await service.calculatePrice('assess-1');

      // No test results → 100% pass rate → 100 is NOT < 100 → no deduction
      expect(result.testDeductions).toBe(0);
      expect(result.finalPrice).toBe(1000);
    });
  });
});
