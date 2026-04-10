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

import { JwtAuthGuard, Roles, RolesGuard } from '../../../shared/auth';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Controller('v1/admin/branch-management/countries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  @Roles('admin-manager')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCountryDto) {
    return this.countryService.create(dto);
  }

  @Get()
  @Roles('admin-manager', 'admin-operation')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.countryService.findAll();
  }

  @Get(':id')
  @Roles('admin-manager', 'admin-operation')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return this.countryService.findById(id);
  }

  @Patch(':id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateCountryDto) {
    return this.countryService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param('id') id: string) {
    return this.countryService.softDelete(id);
  }
}
