import { Injectable } from '@nestjs/common';
import { ProductCategory } from '@prisma/client';

import { PrismaService } from '../../../shared/database';
import { NotFoundException } from '../../../shared/errors';
import { CreateProductModelDto } from './dto/create-product-model.dto';
import { UpdateProductModelDto } from './dto/update-product-model.dto';

@Injectable()
export class ProductModelService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query?: string, category?: ProductCategory, includeInactive = false) {
    const where: Record<string, unknown> = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { brand: { contains: query } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [data, total] = await Promise.all([
      this.prisma.productModel.findMany({ where }),
      this.prisma.productModel.count({ where }),
    ]);

    return { data, total };
  }

  async create(dto: CreateProductModelDto) {
    return this.prisma.productModel.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductModelDto) {
    await this.findById(id);
    return this.prisma.productModel.update({ where: { id }, data: dto });
  }

  async findById(id: string) {
    const model = await this.prisma.productModel.findUnique({
      where: { id },
    });

    if (!model) {
      throw new NotFoundException('Product model not found');
    }

    return model;
  }
}
