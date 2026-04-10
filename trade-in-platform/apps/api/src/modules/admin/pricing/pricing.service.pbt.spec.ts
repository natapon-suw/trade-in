import * as fc from 'fast-check';
import {
  AdjustmentType,
  ConditionOperator,
  ConditionType,
  ProductCategory,
} from '@prisma/client';

import { PricingService } from './pricing.service';

// Arbitraries for generating random pricing data

const categoryArb = fc.constantFrom(
  ProductCategory.LAPTOP,
  ProductCategory.PC,
  ProductCategory.MACBOOK,
);

const conditionTypeArb = fc.constantFrom(
  ConditionType.DEFECT_SEVERITY,
  ConditionType.TEST_PASS_RATE,
  ConditionType.DEFECT_COUNT,
);

const conditionOperatorArb = fc.constantFrom(
  ConditionOperator.GT,
  ConditionOperator.GTE,
  ConditionOperator.LT,
  ConditionOperator.LTE,
  ConditionOperator.EQ,
);

const adjustmentTypeArb = fc.constantFrom(
  AdjustmentType.PERCENTAGE,
  AdjustmentType.FIXED,
);

const pricingRuleArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  category: fc.oneof(categoryArb, fc.constant(null)),
  conditionType: conditionTypeArb,
  conditionOperator: conditionOperatorArb,
  conditionValue: fc.float({ min: 0, max: 100, noNaN: true }),
  adjustmentType: adjustmentTypeArb,
  adjustmentValue: fc.float({ min: -100, max: 0, noNaN: true }),
  priority: fc.integer({ min: 0, max: 100 }),
  isActive: fc.constant(true as const),
  createdAt: fc.constant(new Date()),
  updatedAt: fc.constant(new Date()),
});

const testResultArb = fc.record({
  id: fc.uuid(),
  assessmentId: fc.constant('assess-1'),
  testStepId: fc.uuid(),
  passed: fc.boolean(),
  notes: fc.constant(null as null),
  createdAt: fc.constant(new Date()),
});

const defectArb = fc.record({
  id: fc.uuid(),
  assessmentId: fc.constant('assess-1'),
  defectItemId: fc.uuid(),
  severity: fc.integer({ min: 1, max: 5 }),
  notes: fc.constant(null as null),
});

type TestResult = { id: string; assessmentId: string; testStepId: string; passed: boolean; notes: null; createdAt: Date };
type Defect = { id: string; assessmentId: string; defectItemId: string; severity: number; notes: null };

function makeAssessmentData(
  basePrice: number,
  category: ProductCategory,
  testResults: TestResult[],
  defects: Defect[],
) {
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
      brand: 'Test',
      name: 'Model',
      category,
      basePrice,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    testResults,
    defects,
  };
}

describe('PricingService PBT', () => {
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

  it('property: finalPrice is always >= 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: 0, max: 10000, noNaN: true }),
        categoryArb,
        fc.array(testResultArb, { minLength: 0, maxLength: 10 }),
        fc.array(defectArb, { minLength: 0, maxLength: 10 }),
        fc.array(pricingRuleArb, { minLength: 0, maxLength: 10 }),
        async (basePrice, category, testResults, defects, rules) => {
          const assessment = makeAssessmentData(basePrice, category, testResults, defects);
          prisma.assessment.findUnique.mockResolvedValue(assessment);
          prisma.pricingRule.findMany.mockResolvedValue(
            rules.sort((a, b) => b.priority - a.priority),
          );

          const result = await service.calculatePrice('assess-1');

          expect(result.finalPrice).toBeGreaterThanOrEqual(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('property: more defects results in equal or lower price (with DEFECT_COUNT GT rules)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: 100, max: 10000, noNaN: true }),
        categoryArb,
        fc.array(testResultArb, { minLength: 0, maxLength: 5 }),
        fc.array(defectArb, { minLength: 1, maxLength: 5 }),
        fc.array(defectArb, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 10 }),
        async (basePrice, category, testResults, fewerDefects, extraDefects, threshold) => {
          const moreDefects = [...fewerDefects, ...extraDefects];

          const rule = {
            id: 'rule-1',
            name: 'Defect count rule',
            category: null,
            conditionType: ConditionType.DEFECT_COUNT,
            conditionOperator: ConditionOperator.GT,
            conditionValue: threshold,
            adjustmentType: AdjustmentType.PERCENTAGE,
            adjustmentValue: -10,
            priority: 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Calculate with fewer defects
          const assessFewer = makeAssessmentData(basePrice, category, testResults, fewerDefects);
          prisma.assessment.findUnique.mockResolvedValue(assessFewer);
          prisma.pricingRule.findMany.mockResolvedValue([rule]);
          const resultFewer = await service.calculatePrice('assess-1');

          // Calculate with more defects
          const assessMore = makeAssessmentData(basePrice, category, testResults, moreDefects);
          prisma.assessment.findUnique.mockResolvedValue(assessMore);
          prisma.pricingRule.findMany.mockResolvedValue([rule]);
          const resultMore = await service.calculatePrice('assess-1');

          // More defects should result in equal or lower price
          expect(resultMore.finalPrice).toBeLessThanOrEqual(resultFewer.finalPrice);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('property: higher average severity results in equal or larger deduction', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: 100, max: 10000, noNaN: true }),
        categoryArb,
        fc.array(testResultArb, { minLength: 0, maxLength: 5 }),
        fc.float({ min: 0, max: 3, noNaN: true }),
        async (basePrice, category, testResults, severityThreshold) => {
          const rule = {
            id: 'rule-1',
            name: 'Severity rule',
            category: null,
            conditionType: ConditionType.DEFECT_SEVERITY,
            conditionOperator: ConditionOperator.GT,
            conditionValue: severityThreshold,
            adjustmentType: AdjustmentType.PERCENTAGE,
            adjustmentValue: -15,
            priority: 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Low severity defects (all severity 1)
          const lowDefects: Defect[] = [
            { id: 'd-1', assessmentId: 'assess-1', defectItemId: 'di-1', severity: 1, notes: null },
            { id: 'd-2', assessmentId: 'assess-1', defectItemId: 'di-2', severity: 1, notes: null },
          ];

          // High severity defects (all severity 5)
          const highDefects: Defect[] = [
            { id: 'd-3', assessmentId: 'assess-1', defectItemId: 'di-3', severity: 5, notes: null },
            { id: 'd-4', assessmentId: 'assess-1', defectItemId: 'di-4', severity: 5, notes: null },
          ];

          // Calculate with low severity
          const assessLow = makeAssessmentData(basePrice, category, testResults, lowDefects);
          prisma.assessment.findUnique.mockResolvedValue(assessLow);
          prisma.pricingRule.findMany.mockResolvedValue([rule]);
          const resultLow = await service.calculatePrice('assess-1');

          // Calculate with high severity
          const assessHigh = makeAssessmentData(basePrice, category, testResults, highDefects);
          prisma.assessment.findUnique.mockResolvedValue(assessHigh);
          prisma.pricingRule.findMany.mockResolvedValue([rule]);
          const resultHigh = await service.calculatePrice('assess-1');

          // Higher severity → equal or larger deduction (lower or equal price)
          expect(resultHigh.finalPrice).toBeLessThanOrEqual(resultLow.finalPrice);
        },
      ),
      { numRuns: 100 },
    );
  });
});
