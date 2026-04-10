import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../shared/database';
import {
  ConflictException,
  NotFoundException,
  ValidationException,
} from '../../../shared/errors';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';

@Injectable()
export class ProvinceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProvinceDto) {
    const country = await this.prisma.country.findFirst({
      where: { id: dto.countryId, deletedAt: null },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    await this.checkDuplicateName(dto.name, dto.countryId);

    return this.prisma.province.create({
      data: { name: dto.name, countryId: dto.countryId },
    });
  }

  async findAll(countryId?: string) {
    return this.prisma.province.findMany({
      where: {
        deletedAt: null,
        ...(countryId ? { countryId } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const province = await this.prisma.province.findFirst({
      where: { id, deletedAt: null },
      include: {
        country: { select: { name: true } },
        _count: {
          select: {
            branches: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!province) {
      throw new NotFoundException('Province not found');
    }

    return province;
  }

  async update(id: string, dto: UpdateProvinceDto) {
    const province = await this.prisma.province.findFirst({
      where: { id, deletedAt: null },
    });

    if (!province) {
      throw new NotFoundException('Province not found');
    }

    await this.checkDuplicateName(dto.name, province.countryId, id);

    return this.prisma.province.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async softDelete(id: string) {
    const province = await this.prisma.province.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            branches: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!province) {
      throw new NotFoundException('Province not found');
    }

    if (province._count.branches > 0) {
      throw new ValidationException(
        'Cannot delete province with active branches',
      );
    }

    return this.prisma.province.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async checkDuplicateName(
    name: string,
    countryId: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.province.findFirst({
      where: {
        name,
        countryId,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (existing) {
      throw new ConflictException(
        'A province with this name already exists in this country',
      );
    }
  }
}
