import { Controller, Get, HttpCode, HttpStatus, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard, Roles, RolesGuard } from '../../../shared/auth';
import { ExportAssessmentsQueryDto, ExportStockQueryDto } from './dto/export-query.dto';
import { ExportService } from './export.service';

@Controller('v1/admin/export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('stock')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async exportStock(
    @Query() query: ExportStockQueryDto,
    @Res() res: Response,
  ) {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="stock-export.xlsx"',
    );

    await this.exportService.exportStock(query.category, res);
    res.end();
  }

  @Get('assessments')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async exportAssessments(
    @Query() query: ExportAssessmentsQueryDto,
    @Res() res: Response,
  ) {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="assessments-export.xlsx"',
    );

    await this.exportService.exportAssessments(query.dateFrom, query.dateTo, res);
    res.end();
  }
}
