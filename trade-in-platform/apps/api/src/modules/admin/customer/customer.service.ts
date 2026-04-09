import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../shared/database';
import {
  ConflictException,
  NotFoundException,
} from '../../../shared/errors';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query?: string) {
    const where: Record<string, unknown> = { deletedAt: null };

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({ where }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, total };
  }

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('Phone already exists');
    }

    return this.prisma.customer.create({ data: dto });
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }
}
