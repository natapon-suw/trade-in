import { Injectable } from '@nestjs/common';
import { ProductCategory } from '@prisma/client';

import { PrismaService } from '../../../shared/database';
import { NotFoundException } from '../../../shared/errors';
import { CreateTestGuideDto } from './dto/create-test-guide.dto';
import { UpdateTestGuideDto } from './dto/update-test-guide.dto';

const includeSteps = { steps: { orderBy: { stepNumber: 'asc' as const } } };

@Injectable()
export class TestGuideService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCategory(category: ProductCategory) {
    const data = await this.prisma.testGuide.findMany({
      where: { category, isActive: true },
      include: includeSteps,
      orderBy: { name: 'asc' },
    });

    return { data };
  }

  async create(dto: CreateTestGuideDto) {
    return this.prisma.testGuide.create({
      data: {
        category: dto.category,
        name: dto.name,
        steps: { create: dto.steps },
      },
      include: includeSteps,
    });
  }

  async update(id: string, dto: UpdateTestGuideDto) {
    await this.findById(id);

    const { steps, ...guideData } = dto;

    if (steps) {
      return this.prisma.$transaction(async (tx) => {
        await tx.testStep.deleteMany({ where: { testGuideId: id } });
        return tx.testGuide.update({
          where: { id },
          data: {
            ...guideData,
            steps: { create: steps },
          },
          include: includeSteps,
        });
      });
    }

    return this.prisma.testGuide.update({
      where: { id },
      data: guideData,
      include: includeSteps,
    });
  }

  async findById(id: string) {
    const guide = await this.prisma.testGuide.findUnique({
      where: { id },
      include: includeSteps,
    });

    if (!guide) {
      throw new NotFoundException('Test guide not found');
    }

    return guide;
  }
}
