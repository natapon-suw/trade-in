import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../shared/database';
import {
  ConflictException,
  NotFoundException,
  ValidationException,
} from '../../../shared/errors';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBranchDto) {
    const province = await this.prisma.province.findFirst({
      where: { id: dto.provinceId, deletedAt: null },
    });

    if (!province) {
      throw new NotFoundException('Province not found');
    }

    await this.checkDuplicateName(dto.name, dto.provinceId);

    return this.prisma.branch.create({
      data: {
        name: dto.name,
        address: dto.address,
        provinceId: dto.provinceId,
      },
    });
  }

  async findAll(provinceId?: string, countryId?: string) {
    return this.prisma.branch.findMany({
      where: {
        deletedAt: null,
        ...(provinceId ? { provinceId } : {}),
        ...(countryId ? { province: { countryId } } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
      include: {
        province: {
          select: {
            name: true,
            country: { select: { name: true } },
          },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async update(id: string, dto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (dto.name) {
      await this.checkDuplicateName(dto.name, branch.provinceId, id);
    }

    return this.prisma.branch.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
      },
    });
  }

  async softDelete(id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (branch._count.assignments > 0) {
      throw new ValidationException(
        'Cannot delete branch with active user assignments',
      );
    }

    return this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async checkDuplicateName(
    name: string,
    provinceId: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.branch.findFirst({
      where: {
        name,
        provinceId,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (existing) {
      throw new ConflictException(
        'A branch with this name already exists in this province',
      );
    }
  }
}
