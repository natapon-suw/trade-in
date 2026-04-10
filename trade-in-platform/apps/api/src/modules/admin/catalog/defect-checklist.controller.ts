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
import { DefectChecklistService } from './defect-checklist.service';
import { CreateDefectChecklistDto } from './dto/create-defect-checklist.dto';
import { UpdateDefectChecklistDto } from './dto/update-defect-checklist.dto';

@Controller('v1/admin/defect-checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DefectChecklistController {
  constructor(private readonly defectChecklistService: DefectChecklistService) {}

  @Get()
  @Roles('admin-operation', 'admin-manager')
  @HttpCode(HttpStatus.OK)
  async findByCategory(@Query('category') category: ProductCategory) {
    return this.defectChecklistService.findByCategory(category);
  }

  @Post()
  @Roles('admin-manager')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDefectChecklistDto) {
    return this.defectChecklistService.create(dto);
  }

  @Patch(':id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateDefectChecklistDto) {
    return this.defectChecklistService.update(id, dto);
  }
}
