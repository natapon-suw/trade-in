import { Injectable } from '@nestjs/common';
import {
  AdjustmentType,
  ConditionOperator,
  ConditionType,
} from '@prisma/client';

import { PrismaService } from '../../../shared/database';
import { NotFoundException } from '../../../shared/errors';
import type { PriceBreakdown } from '../../../shared/types/pricing.types';

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async calculatePrice(assessmentId: string): Promise<PriceBreakdown> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        productModel: true,
        testResults: true,
        defects: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const basePrice = Number(assessment.productModel.basePrice);

    // Calculate metrics
    const testPassRate = this.calculateTestPassRate(assessment.testResults);
    const avgDefectSeverity = this.calculateAvgDefectSeverity(
      assessment.defects,
    );
    const defectCount = assessment.defects.length;

    // Load active pricing rules for this product's category (+ null category = applies to all)
    const rules = await this.prisma.pricingRule.findMany({
      where: {
        isActive: true,
        OR: [
          { category: assessment.productModel.category },
          { category: null },
        ],
      },
      orderBy: { priority: 'desc' },
    });

    let testDeductions = 0;
    let defectDeductions = 0;

    for (const rule of rules) {
      const metricValue = this.getMetricValue(
        rule.conditionType,
        testPassRate,
        avgDefectSeverity,
        defectCount,
      );

      if (
        this.evaluateCondition(
          metricValue,
          rule.conditionOperator,
          Number(rule.conditionValue),
        )
      ) {
        const deduction = this.calculateAdjustment(
          rule.adjustmentType,
          Number(rule.adjustmentValue),
          basePrice,
        );

        if (rule.conditionType === ConditionType.TEST_PASS_RATE) {
          testDeductions += deduction;
        } else {
          defectDeductions += deduction;
        }
      }
    }

    const finalPrice = Math.max(0, basePrice + testDeductions + defectDeductions);

    return { basePrice, testDeductions, defectDeductions, finalPrice };
  }

  private calculateTestPassRate(
    testResults: { passed: boolean }[],
  ): number {
    if (testResults.length === 0) return 100;
    const passed = testResults.filter((r) => r.passed).length;
    return (passed / testResults.length) * 100;
  }

  private calculateAvgDefectSeverity(
    defects: { severity: number }[],
  ): number {
    if (defects.length === 0) return 0;
    const total = defects.reduce((sum, d) => sum + d.severity, 0);
    return total / defects.length;
  }

  private getMetricValue(
    conditionType: ConditionType,
    testPassRate: number,
    avgDefectSeverity: number,
    defectCount: number,
  ): number {
    switch (conditionType) {
      case ConditionType.TEST_PASS_RATE:
        return testPassRate;
      case ConditionType.DEFECT_SEVERITY:
        return avgDefectSeverity;
      case ConditionType.DEFECT_COUNT:
        return defectCount;
    }
  }

  private evaluateCondition(
    metricValue: number,
    operator: ConditionOperator,
    conditionValue: number,
  ): boolean {
    switch (operator) {
      case ConditionOperator.GT:
        return metricValue > conditionValue;
      case ConditionOperator.GTE:
        return metricValue >= conditionValue;
      case ConditionOperator.LT:
        return metricValue < conditionValue;
      case ConditionOperator.LTE:
        return metricValue <= conditionValue;
      case ConditionOperator.EQ:
        return metricValue === conditionValue;
    }
  }

  private calculateAdjustment(
    adjustmentType: AdjustmentType,
    adjustmentValue: number,
    basePrice: number,
  ): number {
    switch (adjustmentType) {
      case AdjustmentType.PERCENTAGE:
        return basePrice * (adjustmentValue / 100);
      case AdjustmentType.FIXED:
        return adjustmentValue;
    }
  }
}
