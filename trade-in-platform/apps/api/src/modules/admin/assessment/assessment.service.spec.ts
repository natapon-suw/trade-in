import { AssessmentStatus } from '@prisma/client';

import {
  NotFoundException,
  ValidationException,
} from '../../../shared/errors';
import { AssessmentService } from './assessment.service';

const FULL_INCLUDE = {
  customer: true,
  productModel: true,
  testResults: { include: { testStep: true } },
  photos: true,
  defects: { include: { defectItem: true } },
  stockItem: true,
};

describe('AssessmentService', () => {
  let service: AssessmentService;
  let prisma: {
    customer: { findFirst: jest.Mock };
    productModel: { findUnique: jest.Mock };
    assessment: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    testResult: { createMany: jest.Mock; deleteMany: jest.Mock };
    assessmentDefect: { createMany: jest.Mock; deleteMany: jest.Mock };
    $transaction: jest.Mock;
  };

  const mockAssessment = {
    id: 'assess-1',
    customerId: 'cust-1',
    productModelId: 'model-1',
    assessedById: 'user-1',
    status: AssessmentStatus.MODEL_SELECTED,
    finalPrice: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: { id: 'cust-1', name: 'John' },
    productModel: { id: 'model-1', name: 'MacBook Pro' },
    testResults: [],
    photos: [],
    defects: [],
    stockItem: null,
  };

  beforeEach(() => {
    prisma = {
      customer: { findFirst: jest.fn() },
      productModel: { findUnique: jest.fn() },
      assessment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      testResult: { createMany: jest.fn(), deleteMany: jest.fn() },
      assessmentDefect: { createMany: jest.fn(), deleteMany: jest.fn() },
      $transaction: jest.fn(),
    };
    service = new AssessmentService(prisma as any);
  });

  describe('create', () => {
    it('should create assessment with MODEL_SELECTED status when customer and model exist', async () => {
      const dto = { customerId: 'cust-1', productModelId: 'model-1' };
      prisma.customer.findFirst.mockResolvedValue({ id: 'cust-1' });
      prisma.productModel.findUnique.mockResolvedValue({ id: 'model-1' });
      prisma.assessment.create.mockResolvedValue(mockAssessment);

      const result = await service.create(dto, 'user-1');

      expect(result).toEqual(mockAssessment);
      expect(prisma.assessment.create).toHaveBeenCalledWith({
        data: {
          customerId: 'cust-1',
          productModelId: 'model-1',
          assessedById: 'user-1',
          status: AssessmentStatus.MODEL_SELECTED,
        },
        include: {
          customer: true,
          productModel: true,
        },
      });
    });

    it('should throw NotFoundException for invalid customer', async () => {
      prisma.customer.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          { customerId: 'bad-id', productModelId: 'model-1' },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.assessment.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid product model', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: 'cust-1' });
      prisma.productModel.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          { customerId: 'cust-1', productModelId: 'bad-id' },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.assessment.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return full assessment with all relations', async () => {
      prisma.assessment.findUnique.mockResolvedValue(mockAssessment);

      const result = await service.findById('assess-1');

      expect(result).toEqual(mockAssessment);
      expect(prisma.assessment.findUnique).toHaveBeenCalledWith({
        where: { id: 'assess-1' },
        include: FULL_INCLUDE,
      });
    });

    it('should throw NotFoundException when assessment not found', async () => {
      prisma.assessment.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitTestResults', () => {
    it('should succeed from MODEL_SELECTED status', async () => {
      const assessmentInModelSelected = {
        ...mockAssessment,
        status: AssessmentStatus.MODEL_SELECTED,
      };
      prisma.assessment.findUnique.mockResolvedValue(assessmentInModelSelected);

      const updatedAssessment = {
        ...mockAssessment,
        status: AssessmentStatus.TEST_COMPLETE,
        testResults: [
          { testStepId: 'step-1', passed: true, notes: null },
        ],
      };

      // Mock $transaction to execute the callback with a mock tx
      prisma.$transaction.mockImplementation(async (cb: Function) => {
        const tx = {
          testResult: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          assessment: {
            update: jest.fn().mockResolvedValue(updatedAssessment),
          },
        };
        return cb(tx);
      });

      const dto = {
        results: [{ testStepId: 'step-1', passed: true }],
      };

      const result = await service.submitTestResults('assess-1', dto);

      expect(result.status).toBe(AssessmentStatus.TEST_COMPLETE);
    });

    it('should throw ValidationException from wrong status (DEFECTS_GRADED)', async () => {
      const assessmentInWrongStatus = {
        ...mockAssessment,
        status: AssessmentStatus.DEFECTS_GRADED,
      };
      prisma.assessment.findUnique.mockResolvedValue(assessmentInWrongStatus);

      const dto = {
        results: [{ testStepId: 'step-1', passed: true }],
      };

      await expect(
        service.submitTestResults('assess-1', dto),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when trying to skip statuses', async () => {
      const assessmentInCustomerSelected = {
        ...mockAssessment,
        status: AssessmentStatus.CUSTOMER_SELECTED,
      };
      prisma.assessment.findUnique.mockResolvedValue(
        assessmentInCustomerSelected,
      );

      const dto = {
        results: [{ testStepId: 'step-1', passed: true }],
      };

      // CUSTOMER_SELECTED -> TEST_COMPLETE skips MODEL_SELECTED and TESTING
      await expect(
        service.submitTestResults('assess-1', dto),
      ).rejects.toThrow(ValidationException);
    });
  });

  describe('submitDefects', () => {
    it('should succeed from PHOTOS_CAPTURED status', async () => {
      const assessmentInPhotosCaptured = {
        ...mockAssessment,
        status: AssessmentStatus.PHOTOS_CAPTURED,
      };
      prisma.assessment.findUnique.mockResolvedValue(
        assessmentInPhotosCaptured,
      );

      const updatedAssessment = {
        ...mockAssessment,
        status: AssessmentStatus.DEFECTS_GRADED,
        defects: [
          { defectItemId: 'defect-1', severity: 3, notes: null },
        ],
      };

      prisma.$transaction.mockImplementation(async (cb: Function) => {
        const tx = {
          assessmentDefect: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          assessment: {
            update: jest.fn().mockResolvedValue(updatedAssessment),
          },
        };
        return cb(tx);
      });

      const dto = {
        defects: [{ defectItemId: 'defect-1', severity: 3 }],
      };

      const result = await service.submitDefects('assess-1', dto);

      expect(result.status).toBe(AssessmentStatus.DEFECTS_GRADED);
    });

    it('should throw ValidationException from wrong status (MODEL_SELECTED)', async () => {
      const assessmentInWrongStatus = {
        ...mockAssessment,
        status: AssessmentStatus.MODEL_SELECTED,
      };
      prisma.assessment.findUnique.mockResolvedValue(assessmentInWrongStatus);

      const dto = {
        defects: [{ defectItemId: 'defect-1', severity: 3 }],
      };

      await expect(
        service.submitDefects('assess-1', dto),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException from TEST_COMPLETE (photos not done yet)', async () => {
      const assessmentInTestComplete = {
        ...mockAssessment,
        status: AssessmentStatus.TEST_COMPLETE,
      };
      prisma.assessment.findUnique.mockResolvedValue(assessmentInTestComplete);

      const dto = {
        defects: [{ defectItemId: 'defect-1', severity: 3 }],
      };

      await expect(
        service.submitDefects('assess-1', dto),
      ).rejects.toThrow(ValidationException);
    });
  });
});
