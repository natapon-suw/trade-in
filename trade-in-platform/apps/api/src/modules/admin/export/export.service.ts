import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Workbook } from 'exceljs';
import type { Response } from 'express';

import { PrismaService } from '../../../shared/database';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportStock(category: string | undefined, res: Response) {
    const where: Prisma.StockItemWhereInput = {};
    if (category) {
      where.productModel = { category: category as any };
    }

    const items = await this.prisma.stockItem.findMany({
      where,
      include: { productModel: true },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Stock');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Brand', key: 'brand', width: 15 },
      { header: 'Model', key: 'model', width: 25 },
      { header: 'Category', key: 'category', width: 12 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Condition Grade', key: 'conditionGrade', width: 16 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date Added', key: 'dateAdded', width: 20 },
    ];

    for (const item of items) {
      sheet.addRow({
        id: item.id,
        brand: item.productModel.brand,
        model: item.productModel.name,
        category: item.productModel.category,
        price: Number(item.price),
        conditionGrade: item.conditionGrade,
        status: item.status,
        dateAdded: item.createdAt,
      });
    }

    await workbook.xlsx.write(res);
  }

  async exportAssessments(
    dateFrom: string | undefined,
    dateTo: string | undefined,
    res: Response,
  ) {
    const where: Prisma.AssessmentWhereInput = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const assessments = await this.prisma.assessment.findMany({
      where,
      include: {
        customer: true,
        productModel: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Assessments');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Product Model', key: 'productModel', width: 25 },
      { header: 'Category', key: 'category', width: 12 },
      { header: 'Status', key: 'status', width: 18 },
      { header: 'Final Price', key: 'finalPrice', width: 12 },
      { header: 'Date', key: 'date', width: 20 },
    ];

    for (const a of assessments) {
      sheet.addRow({
        id: a.id,
        customer: a.customer.name,
        phone: a.customer.phone,
        productModel: a.productModel.name,
        category: a.productModel.category,
        status: a.status,
        finalPrice: a.finalPrice ? Number(a.finalPrice) : null,
        date: a.createdAt,
      });
    }

    await workbook.xlsx.write(res);
  }
}
