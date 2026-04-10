import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard, Roles, RolesGuard } from '../../../shared/auth';
import { StockFilterDto } from './dto/stock-filter.dto';
import { StockService } from './stock.service';

@Controller('v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('assessments/:id/stock')
  @Roles('admin-operation')
  @HttpCode(HttpStatus.CREATED)
  async addToStock(@Param('id') id: string) {
    return this.stockService.addToStock(id);
  }

  @Get('stock')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: StockFilterDto) {
    return this.stockService.findAll(filters);
  }

  @Get('stock/:id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return this.stockService.findById(id);
  }
}
