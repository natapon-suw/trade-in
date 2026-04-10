import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/database';
import { NotFoundException } from '../../shared/errors';
import { ProductCategory, StockStatus } from '@prisma/client';

export interface BuyerProduct {
  id: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  conditionGrade: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface BuyerProductDetail {
  id: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  conditionGrade: string;
  photos: { id: string; url: string }[];
  testSummary: { passed: number; failed: number };
  defectSummary: { count: number; averageSeverity: number };
  createdAt: string;
}

@Injectable()
export class BuyerService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(
    category?: ProductCategory,
    page = 1,
    pageSize = 20,
  ): Promise<{ data: BuyerProduct[]; total: number; page: number; pageSize: number }> {
    const where: Record<string, unknown> = { status: StockStatus.AVAILABLE };
    if (category) {
      where.productModel = { category };
    }

    const [items, total] = await Promise.all([
      this.prisma.stockItem.findMany({
        where,
        include: {
          productModel: true,
          assessment: { include: { photos: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.stockItem.count({ where }),
    ]);

    const data: BuyerProduct[] = items.map((item) => {
      const firstPhoto = item.assessment?.photos?.[0];
      return {
        id: item.id,
        brand: item.productModel.brand,
        model: item.productModel.name,
        category: item.productModel.category,
        price: Number(item.price),
        conditionGrade: item.conditionGrade,
        photoUrl: firstPhoto
          ? `/uploads/${item.assessmentId}/${firstPhoto.filename}`
          : null,
        createdAt: item.createdAt.toISOString(),
      };
    });

    return { data, total, page, pageSize };
  }

  async getProductDetail(id: string): Promise<BuyerProductDetail> {
    const item = await this.prisma.stockItem.findUnique({
      where: { id },
      include: {
        productModel: true,
        assessment: {
          include: {
            photos: true,
            testResults: true,
            defects: true,
          },
        },
      },
    });

    if (!item || item.status !== StockStatus.AVAILABLE) {
      throw new NotFoundException('Product not found');
    }

    const photos = (item.assessment?.photos ?? []).map((p) => ({
      id: p.id,
      url: `/uploads/${item.assessmentId}/${p.filename}`,
    }));

    const testResults = item.assessment?.testResults ?? [];
    const passed = testResults.filter((t) => t.passed).length;
    const failed = testResults.filter((t) => !t.passed).length;

    const defects = item.assessment?.defects ?? [];
    const defectCount = defects.length;
    const averageSeverity =
      defectCount > 0
        ? Math.round(
            (defects.reduce((sum, d) => sum + d.severity, 0) / defectCount) * 100,
          ) / 100
        : 0;

    return {
      id: item.id,
      brand: item.productModel.brand,
      model: item.productModel.name,
      category: item.productModel.category,
      price: Number(item.price),
      conditionGrade: item.conditionGrade,
      photos,
      testSummary: { passed, failed },
      defectSummary: { count: defectCount, averageSeverity },
      createdAt: item.createdAt.toISOString(),
    };
  }
}
