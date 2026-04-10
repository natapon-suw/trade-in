import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard, Roles, RolesGuard } from '../../../shared/auth';
import { HierarchyService } from './hierarchy.service';

@Controller('v1/admin/branch-management/hierarchy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HierarchyController {
  constructor(private readonly hierarchyService: HierarchyService) {}

  @Get()
  @Roles('admin-manager', 'admin-operation')
  @HttpCode(HttpStatus.OK)
  async getFullHierarchy() {
    return this.hierarchyService.getFullHierarchy();
  }

  @Get(':countryId')
  @Roles('admin-manager', 'admin-operation')
  @HttpCode(HttpStatus.OK)
  async getCountryHierarchy(@Param('countryId') countryId: string) {
    return this.hierarchyService.getCountryHierarchy(countryId);
  }
}
