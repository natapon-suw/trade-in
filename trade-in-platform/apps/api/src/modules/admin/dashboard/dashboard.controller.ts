import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard, Roles, RolesGuard } from '../../../shared/auth';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Controller('v1/admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async getMetrics(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getMetrics(query.dateFrom, query.dateTo, query.branchId);
  }
}
