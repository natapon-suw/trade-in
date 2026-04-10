import { Injectable } from '@nestjs/common';
import { AssessmentStatus } from '@prisma/client';

import { PrismaService } from '../../../shared/database';
import {
  NotFoundException,
  ValidationException,
} from '../../../shared/errors';
import { UserBranchService } from '../branch-management/user-branch.service';
import { PricingService } from '../pricing/pricing.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { PriceOverrideDto } from './dto/price-override.dto';
import { SubmitDefectsDto } from './dto/submit-defects.dto';
import { SubmitTestResultsDto } from './dto/submit-test-results.dto';

const STATUS_ORDER: AssessmentStatus[] = [
  AssessmentStatus.CUSTOMER_SELECTED,
  AssessmentStatus.MODEL_SELECTED,
  AssessmentStatus.TESTING,
  AssessmentStatus.TEST_COMPLETE,
  AssessmentStatus.PHOTOS_CAPTURED,
  AssessmentStatus.DEFECTS_GRADED,
  AssessmentStatus.PRICED,
  AssessmentStatus.STOCKED,
];

@Injectable()
export class AssessmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
    private readonly userBranchService: UserBranchService,
  ) {}

  async create(dto: CreateAssessmentDto, assessedById: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, deletedAt: null },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const productModel = await this.prisma.productModel.findUnique({
      where: { id: dto.productModelId },
    });
    if (!productModel) {
      throw new NotFoundException('Product model not found');
    }

    // Resolve branchId from user's assignments
    const userBranchIds = await this.userBranchService.getUserBranchIds(assessedById);
    let branchId: string | null = null;

    if (userBranchIds.length === 0) {
      throw new ValidationException(
        'User has no branch assignments — cannot create assessment',
      );
    } else if (dto.branchId) {
      if (!userBranchIds.includes(dto.branchId)) {
        throw new ValidationException(
          'Provided branchId is not in user\'s assigned branches',
        );
      }
      branchId = dto.branchId;
    } else if (userBranchIds.length === 1) {
      branchId = userBranchIds[0];
    }

    return this.prisma.assessment.create({
      data: {
        customerId: dto.customerId,
        productModelId: dto.productModelId,
        assessedById,
        branchId,
        status: AssessmentStatus.MODEL_SELECTED,
      },
      include: {
        customer: true,
        productModel: true,
      },
    });
  }

  async findById(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        customer: true,
        productModel: true,
        testResults: { include: { testStep: true } },
        photos: true,
        defects: { include: { defectItem: true } },
        stockItem: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    return assessment;
  }

  async submitTestResults(id: string, dto: SubmitTestResultsDto) {
    const assessment = await this.findById(id);

    // Submitting test results is valid from MODEL_SELECTED or TESTING
    // (covers the TESTING intermediate state implicitly)
    if (
      assessment.status !== AssessmentStatus.MODEL_SELECTED &&
      assessment.status !== AssessmentStatus.TESTING
    ) {
      throw new ValidationException(
        `Cannot submit test results from status ${assessment.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete existing test results for idempotency
      await tx.testResult.deleteMany({ where: { assessmentId: id } });

      await tx.testResult.createMany({
        data: dto.results.map((r) => ({
          assessmentId: id,
          testStepId: r.testStepId,
          passed: r.passed,
          notes: r.notes,
        })),
      });

      return tx.assessment.update({
        where: { id },
        data: { status: AssessmentStatus.TEST_COMPLETE },
        include: {
          customer: true,
          productModel: true,
          testResults: { include: { testStep: true } },
          photos: true,
          defects: { include: { defectItem: true } },
          stockItem: true,
        },
      });
    });
  }

  async submitDefects(id: string, dto: SubmitDefectsDto) {
    const assessment = await this.findById(id);

    // Defects can only be submitted after photos are captured
    if (assessment.status !== AssessmentStatus.PHOTOS_CAPTURED) {
      throw new ValidationException(
        `Cannot submit defects from status ${assessment.status}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Delete existing defects for idempotency
      await tx.assessmentDefect.deleteMany({ where: { assessmentId: id } });

      await tx.assessmentDefect.createMany({
        data: dto.defects.map((d) => ({
          assessmentId: id,
          defectItemId: d.defectItemId,
          severity: d.severity,
          notes: d.notes,
        })),
      });

      await tx.assessment.update({
        where: { id },
        data: { status: AssessmentStatus.DEFECTS_GRADED },
      });
    });

    // Auto-calculate price after defects are saved
    const priceBreakdown = await this.pricingService.calculatePrice(id);

    return this.prisma.assessment.update({
      where: { id },
      data: {
        finalPrice: priceBreakdown.finalPrice,
        status: AssessmentStatus.PRICED,
      },
      include: {
        customer: true,
        productModel: true,
        testResults: { include: { testStep: true } },
        photos: true,
        defects: { include: { defectItem: true } },
        stockItem: true,
      },
    });
  }

  async updateStatus(id: string, status: AssessmentStatus) {
    const assessment = await this.findById(id);
    this.validateStatusTransition(assessment.status, status);

    return this.prisma.assessment.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        productModel: true,
        testResults: { include: { testStep: true } },
        photos: true,
        defects: { include: { defectItem: true } },
        stockItem: true,
      },
    });
  }

  private validateStatusTransition(
    current: AssessmentStatus,
    next: AssessmentStatus,
  ) {
    const currentIndex = STATUS_ORDER.indexOf(current);
    const nextIndex = STATUS_ORDER.indexOf(next);

    if (nextIndex <= currentIndex) {
      throw new ValidationException(
        `Invalid status transition from ${current} to ${next}`,
      );
    }

    // Can only advance one step at a time (no skipping)
    if (nextIndex !== currentIndex + 1) {
      throw new ValidationException(
        `Cannot skip status from ${current} to ${next}`,
      );
    }
  }

  async priceOverride(id: string, dto: PriceOverrideDto, overrideById: string) {
    const assessment = await this.findById(id);

    if (
      assessment.status !== AssessmentStatus.PRICED &&
      assessment.status !== AssessmentStatus.DEFECTS_GRADED
    ) {
      throw new ValidationException(
        `Cannot override price from status ${assessment.status}`,
      );
    }

    return this.prisma.assessment.update({
      where: { id },
      data: {
        finalPrice: dto.price,
        priceOverrideReason: dto.reason,
        priceOverrideById: overrideById,
        status: AssessmentStatus.PRICED,
      },
      include: {
        customer: true,
        productModel: true,
        testResults: { include: { testStep: true } },
        photos: true,
        defects: { include: { defectItem: true } },
        stockItem: true,
      },
    });
  }
}
