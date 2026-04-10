import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  CurrentUser,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from '../../../shared/auth';
import type { AuthContext } from '../../../shared/auth';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { PriceOverrideDto } from './dto/price-override.dto';
import { SubmitDefectsDto } from './dto/submit-defects.dto';
import { SubmitTestResultsDto } from './dto/submit-test-results.dto';

@Controller('v1/admin/assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  @Roles('admin-operation')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateAssessmentDto,
    @CurrentUser() user: AuthContext,
  ) {
    return this.assessmentService.create(dto, user.userId);
  }

  @Get(':id')
  @Roles('admin-operation', 'admin-manager')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return this.assessmentService.findById(id);
  }

  @Patch(':id/test-results')
  @Roles('admin-operation')
  @HttpCode(HttpStatus.OK)
  async submitTestResults(
    @Param('id') id: string,
    @Body() dto: SubmitTestResultsDto,
  ) {
    return this.assessmentService.submitTestResults(id, dto);
  }

  @Patch(':id/defects')
  @Roles('admin-operation')
  @HttpCode(HttpStatus.OK)
  async submitDefects(
    @Param('id') id: string,
    @Body() dto: SubmitDefectsDto,
  ) {
    return this.assessmentService.submitDefects(id, dto);
  }

  @Patch(':id/price-override')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async priceOverride(
    @Param('id') id: string,
    @Body() dto: PriceOverrideDto,
    @CurrentUser() user: AuthContext,
  ) {
    return this.assessmentService.priceOverride(id, dto, user.userId);
  }
}
