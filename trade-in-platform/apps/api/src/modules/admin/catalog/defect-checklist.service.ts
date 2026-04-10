import { Injectable } from '@nestjs/common';
import { ProductCategory } from '@prisma/client';

import { PrismaService } from '../../../shared/database';
import { NotFoundException } from '../../../shared/errors';
import { CreateDefectChecklistDto } from './dto/create-defect-checklist.dto';
import { UpdateDefectChecklistDto } from './dto/update-defect-checklist.dto';

const includeItems = { items: true };

@Injectable()
export class DefectChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCategory(category: ProductCategory) {
    const data = await this.prisma.defectChecklist.findMany({
      where: { category, isActive: true },
      include: includeItems,
      orderBy: { name: 'asc' },
    });

    return { data };
  }

  async create(dto: CreateDefectChecklistDto) {
    return this.prisma.defectChecklist.create({
      data: {
        category: dto.category,
        name: dto.name,
        items: { create: dto.items },
      },
      include: includeItems,
    });
  }

  async update(id: string, dto: UpdateDefectChecklistDto) {
    await this.findById(id);

    const { items, ...checklistData } = dto;

    if (items) {
      return this.prisma.$transaction(async (tx) => {
        await tx.defectItem.deleteMany({ where: { defectChecklistId: id } });
        return tx.defectChecklist.update({
          where: { id },
          data: {
            ...checklistData,
            items: { create: items },
          },
          include: includeItems,
        });
      });
    }

    return this.prisma.defectChecklist.update({
      where: { id },
      data: checklistData,
      include: includeItems,
    });
  }

  async findById(id: string) {
    const checklist = await this.prisma.defectChecklist.findUnique({
      where: { id },
      include: includeItems,
    });

    if (!checklist) {
      throw new NotFoundException('Defect checklist not found');
    }

    return checklist;
  }
}
