import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard, RolesGuard, Roles } from '../../../shared/auth';
import { ProductModelService } from './product-model.service';
import { CreateProductModelDto } from './dto/create-product-model.dto';
import { UpdateProductModelDto } from './dto/update-product-model.dto';
import { SearchProductModelDto } from './dto/search-product-model.dto';

@Controller('v1/admin/product-models')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductModelController {
  constructor(private readonly productModelService: ProductModelService) {}

  @Get()
  @Roles('admin-operation', 'admin-manager')
  @HttpCode(HttpStatus.OK)
  async search(@Query() dto: SearchProductModelDto) {
    return this.productModelService.search(dto.search, dto.category);
  }

  @Post()
  @Roles('admin-manager')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductModelDto) {
    return this.productModelService.create(dto);
  }

  @Patch(':id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateProductModelDto) {
    return this.productModelService.update(id, dto);
  }
}
