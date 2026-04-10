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
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard, Roles, RolesGuard } from '../../../shared/auth';
import { ProvinceService } from './province.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';

@Controller('v1/admin/branch-management/provinces')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Post()
  @Roles('admin-manager')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProvinceDto) {
    return this.provinceService.create(dto);
  }

  @Get()
  @Roles('admin-manager', 'admin-operation')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('countryId') countryId?: string) {
    return this.provinceService.findAll(countryId);
  }

  @Get(':id')
  @Roles('admin-manager', 'admin-operation')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return this.provinceService.findById(id);
  }

  @Patch(':id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateProvinceDto) {
    return this.provinceService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param('id') id: string) {
    return this.provinceService.softDelete(id);
  }
}
