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
import { ProductCategory } from '@prisma/client';

import { JwtAuthGuard, RolesGuard, Roles } from '../../../shared/auth';
import { TestGuideService } from './test-guide.service';
import { CreateTestGuideDto } from './dto/create-test-guide.dto';
import { UpdateTestGuideDto } from './dto/update-test-guide.dto';

@Controller('v1/admin/test-guides')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestGuideController {
  constructor(private readonly testGuideService: TestGuideService) {}

  @Get()
  @Roles('admin-operation', 'admin-manager')
  @HttpCode(HttpStatus.OK)
  async findByCategory(@Query('category') category: ProductCategory) {
    return this.testGuideService.findByCategory(category);
  }

  @Post()
  @Roles('admin-manager')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTestGuideDto) {
    return this.testGuideService.create(dto);
  }

  @Patch(':id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateTestGuideDto) {
    return this.testGuideService.update(id, dto);
  }
}
