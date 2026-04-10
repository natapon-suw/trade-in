import { Injectable } from '@nestjs/common';
import { StockStatus } from '@prisma/client';

import { PrismaService } from '../../../shared/database';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(dateFrom?: string, dateTo?: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const assessmentDateFilter = {
      gte: dateFrom ? new Date(dateFrom) : startOfDay,
      lte: dateTo ? new Date(dateTo) : endOfDay,
    };

    const [assessedToday, totalStock, stockValueResult, recentActivity] = await Promise.all([
      this.prisma.assessment.count({
        where: { createdAt: assessmentDateFilter },
      }),

      this.prisma.stockItem.count({
        where: { status: StockStatus.AVAILABLE },
      }),

      this.prisma.stockItem.aggregate({
        _sum: { price: true },
        where: { status: StockStatus.AVAILABLE },
      }),

      this.prisma.assessment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
          productModel: { select: { name: true } },
        },
      }),
    ]);

    return {
      assessedToday,
      totalStock,
      stockValue: stockValueResult._sum.price ?? 0,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        customerName: a.customer.name,
        productModelName: a.productModel.name,
        status: a.status,
        createdAt: a.createdAt,
      })),
    };
  }
}
