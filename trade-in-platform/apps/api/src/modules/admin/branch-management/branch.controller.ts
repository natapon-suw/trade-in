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
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller('v1/admin/branch-management/branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles('admin-manager')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @Get()
  @Roles('admin-manager', 'admin-operation')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('provinceId') provinceId?: string,
    @Query('countryId') countryId?: string,
  ) {
    return this.branchService.findAll(provinceId, countryId);
  }

  @Get(':id')
  @Roles('admin-manager', 'admin-operation')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return this.branchService.findById(id);
  }

  @Patch(':id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param('id') id: string) {
    return this.branchService.softDelete(id);
  }
}
