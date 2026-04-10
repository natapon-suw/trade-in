import { Injectable } from '@nestjs/common';
import { AssessmentStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../shared/database';
import {
  NotFoundException,
  ValidationException,
} from '../../../shared/errors';
import type { PaginatedResponse } from '../../../shared/types/pagination.types';
import { calculateConditionGrade } from './condition-grade.util';
import { StockFilterDto } from './dto/stock-filter.dto';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async addToStock(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        defects: true,
        productModel: true,
        stockItem: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (assessment.status !== AssessmentStatus.PRICED) {
      throw new ValidationException(
        `Cannot add to stock from status ${assessment.status}`,
      );
    }

    if (assessment.stockItem) {
      throw new ValidationException(
        'Assessment already has a stock item',
      );
    }

    const conditionGrade = calculateConditionGrade(assessment.defects);

    const [stockItem] = await this.prisma.$transaction([
      this.prisma.stockItem.create({
        data: {
          assessmentId: assessment.id,
          productModelId: assessment.productModelId,
          price: assessment.finalPrice!,
          conditionGrade,
        },
        include: { productModel: true },
      }),
      this.prisma.assessment.update({
        where: { id: assessmentId },
        data: { status: AssessmentStatus.STOCKED },
      }),
    ]);

    return stockItem;
  }

  async findAll(filters: StockFilterDto): Promise<PaginatedResponse<any>> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StockItemWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.category) {
      where.productModel = { category: filters.category };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) {
        where.price.gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        where.price.lte = filters.priceMax;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.stockItem.findMany({
        where,
        include: { productModel: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockItem.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findById(id: string) {
    const stockItem = await this.prisma.stockItem.findUnique({
      where: { id },
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

    if (!stockItem) {
      throw new NotFoundException('Stock item not found');
    }

    return stockItem;
  }
}
