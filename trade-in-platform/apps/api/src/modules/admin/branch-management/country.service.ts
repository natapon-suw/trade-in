import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../shared/database';
import {
  ConflictException,
  NotFoundException,
  ValidationException,
} from '../../../shared/errors';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCountryDto) {
    await this.checkDuplicateName(dto.name);

    return this.prisma.country.create({
      data: { name: dto.name },
    });
  }

  async findAll() {
    return this.prisma.country.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const country = await this.prisma.country.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            provinces: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    return country;
  }

  async update(id: string, dto: UpdateCountryDto) {
    const country = await this.prisma.country.findFirst({
      where: { id, deletedAt: null },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    await this.checkDuplicateName(dto.name, id);

    return this.prisma.country.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async softDelete(id: string) {
    const country = await this.prisma.country.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            provinces: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    if (country._count.provinces > 0) {
      throw new ValidationException(
        'Cannot delete country with active provinces',
      );
    }

    return this.prisma.country.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async checkDuplicateName(name: string, excludeId?: string) {
    const existing = await this.prisma.country.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (existing) {
      throw new ConflictException('A country with this name already exists');
    }
  }
}
