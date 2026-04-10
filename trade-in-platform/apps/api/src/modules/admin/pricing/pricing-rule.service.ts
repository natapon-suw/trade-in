import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../shared/database';
import { NotFoundException } from '../../../shared/errors';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';

@Injectable()
export class PricingRuleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pricingRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });
  }

  async create(dto: CreatePricingRuleDto) {
    return this.prisma.pricingRule.create({ data: dto });
  }

  async update(id: string, dto: UpdatePricingRuleDto) {
    await this.findById(id);
    return this.prisma.pricingRule.update({ where: { id }, data: dto });
  }

  async deactivate(id: string) {
    await this.findById(id);
    return this.prisma.pricingRule.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findById(id: string) {
    const rule = await this.prisma.pricingRule.findUnique({ where: { id } });

    if (!rule) {
      throw new NotFoundException('Pricing rule not found');
    }

    return rule;
  }
}
