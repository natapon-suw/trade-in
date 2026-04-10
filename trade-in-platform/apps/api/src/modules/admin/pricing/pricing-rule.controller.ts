import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard, RolesGuard, Roles } from '../../../shared/auth';
import { PricingRuleService } from './pricing-rule.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';

@Controller('v1/admin/pricing-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin-manager')
export class PricingRuleController {
  constructor(private readonly pricingRuleService: PricingRuleService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.pricingRuleService.findAll();
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePricingRuleDto) {
    return this.pricingRuleService.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdatePricingRuleDto) {
    return this.pricingRuleService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string) {
    return this.pricingRuleService.deactivate(id);
  }
}
