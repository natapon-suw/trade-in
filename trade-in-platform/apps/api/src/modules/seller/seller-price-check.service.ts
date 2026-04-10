import { Injectable } from '@nestjs/common';
import {
  AdjustmentType,
  ConditionOperator,
  ConditionType,
  ProductCategory,
} from '@prisma/client';

import { PrismaService } from '../../shared/database';
import { NotFoundException } from '../../shared/errors';
import { PriceCheckDto } from './dto/price-check.dto';

export interface PriceCheckResult {
  estimatedMin: number;
  estimatedMax: number;
  basePrice: number;
  deductions: number;
  finalEstimate: number;
}

@Injectable()
export class SellerPriceCheckService {
  constructor(private readonly prisma: PrismaService) {}

  async checkPrice(dto: PriceCheckDto): Promise<PriceCheckResult> {
    const model = await this.prisma.productModel.findUnique({
      where: { id: dto.productModelId },
    });

    if (!model) {
      throw new NotFoundException('Product model not found');
    }

    const basePrice = Number(model.basePrice);

    // Load active pricing rules for this category + global (null category)
    const rules = await this.prisma.pricingRule.findMany({
      where: {
        isActive: true,
        OR: [{ category: model.category }, { category: null }],
      },
      orderBy: { priority: 'desc' },
    });

    // Calculate metrics from provided defects
    const defectCount = dto.defects.length;
    const avgSeverity =
      defectCount > 0
        ? dto.defects.reduce((sum, d) => sum + d.severity, 0) / defectCount
        : 0;
    const testPassRate = 100; // No tests for seller estimate

    let testDeductions = 0;
    let defectDeductions = 0;

    for (const rule of rules) {
      const metricValue = this.getMetricValue(
        rule.conditionType,
        testPassRate,
        avgSeverity,
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

    const totalDeductions = testDeductions + defectDeductions;
    const finalEstimate = Math.max(0, basePrice + totalDeductions);

    // Apply ±10% variance for min/max range
    const estimatedMin = Math.max(0, Math.round(finalEstimate * 0.9 * 100) / 100);
    const estimatedMax = Math.round(finalEstimate * 1.1 * 100) / 100;

    return {
      estimatedMin,
      estimatedMax,
      basePrice,
      deductions: totalDeductions,
      finalEstimate,
    };
  }

  async searchModels(query?: string) {
    const where: Record<string, unknown> = { isActive: true };

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { brand: { contains: query } },
      ];
    }

    return this.prisma.productModel.findMany({ where });
  }

  private getMetricValue(
    conditionType: ConditionType,
    testPassRate: number,
    avgSeverity: number,
    defectCount: number,
  ): number {
    switch (conditionType) {
      case ConditionType.TEST_PASS_RATE:
        return testPassRate;
      case ConditionType.DEFECT_SEVERITY:
        return avgSeverity;
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
