import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../shared/database';
import { NotFoundException } from '../../../shared/errors';

@Injectable()
export class HierarchyService {
  constructor(private readonly prisma: PrismaService) {}

  async getFullHierarchy() {
    return this.prisma.country.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        provinces: {
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            branches: {
              where: { deletedAt: null },
              orderBy: { name: 'asc' },
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });
  }

  async getCountryHierarchy(countryId: string) {
    const country = await this.prisma.country.findFirst({
      where: { id: countryId, deletedAt: null },
      select: {
        id: true,
        name: true,
        provinces: {
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            branches: {
              where: { deletedAt: null },
              orderBy: { name: 'asc' },
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    return country;
  }
}
