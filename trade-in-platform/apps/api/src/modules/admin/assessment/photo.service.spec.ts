import 'multer';
import { AssessmentStatus, UploadVia } from '@prisma/client';

import {
  NotFoundException,
  ValidationException,
} from '../../../shared/errors';
import { PhotoService } from './photo.service';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

// Mock crypto.randomUUID
jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mock-uuid-1234'),
}));

import * as fs from 'fs/promises';

describe('PhotoService', () => {
  let service: PhotoService;
  let prisma: {
    assessment: { findUnique: jest.Mock; update: jest.Mock };
    assessmentPhoto: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };
  let configService: { get: jest.Mock };

  const mockAssessment = {
    id: 'assess-1',
    status: AssessmentStatus.TEST_COMPLETE,
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'photos',
    originalname: 'test-photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 100, // 100KB
    buffer: Buffer.from('fake-image-data'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  const mockPhotoRecord = {
    id: 'photo-1',
    assessmentId: 'assess-1',
    filename: 'mock-uuid-1234.jpg',
    originalName: 'test-photo.jpg',
    mimeType: 'image/jpeg',
    size: 102400,
    uploadedVia: UploadVia.PC,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    prisma = {
      assessment: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      assessmentPhoto: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    configService = {
      get: jest.fn().mockReturnValue('./test-uploads'),
    };

    service = new PhotoService(prisma as any, configService as any);
  });

  describe('upload', () => {
    it('should create photo records and save files to disk', async () => {
      prisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      prisma.assessmentPhoto.create.mockResolvedValue(mockPhotoRecord);
      prisma.assessment.update.mockResolvedValue({
        ...mockAssessment,
        status: AssessmentStatus.PHOTOS_CAPTURED,
      });

      const result = await service.upload(
        'assess-1',
        [mockFile],
        UploadVia.PC,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockPhotoRecord);

      // Verify directory was created
      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('assess-1'),
        { recursive: true },
      );

      // Verify file was written
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('mock-uuid-1234.jpg'),
        mockFile.buffer,
      );

      // Verify DB record was created
      expect(prisma.assessmentPhoto.create).toHaveBeenCalledWith({
        data: {
          assessmentId: 'assess-1',
          filename: 'mock-uuid-1234.jpg',
          originalName: 'test-photo.jpg',
          mimeType: 'image/jpeg',
          size: mockFile.size,
          uploadedVia: UploadVia.PC,
        },
      });

      // Verify status was updated to PHOTOS_CAPTURED
      expect(prisma.assessment.update).toHaveBeenCalledWith({
        where: { id: 'assess-1' },
        data: { status: AssessmentStatus.PHOTOS_CAPTURED },
      });
    });

    it('should not update status if already PHOTOS_CAPTURED', async () => {
      const assessmentAlreadyCaptured = {
        ...mockAssessment,
        status: AssessmentStatus.PHOTOS_CAPTURED,
      };
      prisma.assessment.findUnique.mockResolvedValue(assessmentAlreadyCaptured);
      prisma.assessmentPhoto.create.mockResolvedValue(mockPhotoRecord);

      await service.upload('assess-1', [mockFile], UploadVia.PC);

      expect(prisma.assessment.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when assessment does not exist', async () => {
      prisma.assessment.findUnique.mockResolvedValue(null);

      await expect(
        service.upload('nonexistent', [mockFile], UploadVia.PC),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ValidationException for invalid assessment status', async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        ...mockAssessment,
        status: AssessmentStatus.MODEL_SELECTED,
      });

      await expect(
        service.upload('assess-1', [mockFile], UploadVia.PC),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException for invalid file format', async () => {
      prisma.assessment.findUnique.mockResolvedValue(mockAssessment);

      const invalidFile = {
        ...mockFile,
        mimetype: 'application/pdf',
        originalname: 'document.pdf',
      };

      await expect(
        service.upload('assess-1', [invalidFile as Express.Multer.File], UploadVia.PC),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException for file exceeding 10MB', async () => {
      prisma.assessment.findUnique.mockResolvedValue(mockAssessment);

      const largeFile = {
        ...mockFile,
        size: 11 * 1024 * 1024, // 11MB
      };

      await expect(
        service.upload('assess-1', [largeFile as Express.Multer.File], UploadVia.PC),
      ).rejects.toThrow(ValidationException);
    });

    it('should handle multiple files in a single upload', async () => {
      prisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      prisma.assessmentPhoto.create.mockResolvedValue(mockPhotoRecord);
      prisma.assessment.update.mockResolvedValue({
        ...mockAssessment,
        status: AssessmentStatus.PHOTOS_CAPTURED,
      });

      const pngFile = {
        ...mockFile,
        originalname: 'photo2.png',
        mimetype: 'image/png',
      };

      const result = await service.upload(
        'assess-1',
        [mockFile, pngFile as Express.Multer.File],
        UploadVia.PC,
      );

      expect(result).toHaveLength(2);
      expect(fs.writeFile).toHaveBeenCalledTimes(2);
      expect(prisma.assessmentPhoto.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('findByAssessment', () => {
    it('should return photos ordered by createdAt', async () => {
      const photos = [mockPhotoRecord];
      prisma.assessmentPhoto.findMany.mockResolvedValue(photos);

      const result = await service.findByAssessment('assess-1');

      expect(result).toEqual(photos);
      expect(prisma.assessmentPhoto.findMany).toHaveBeenCalledWith({
        where: { assessmentId: 'assess-1' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo record and file from disk', async () => {
      prisma.assessmentPhoto.findUnique.mockResolvedValue(mockPhotoRecord);
      prisma.assessmentPhoto.delete.mockResolvedValue(mockPhotoRecord);

      const result = await service.deletePhoto('photo-1');

      expect(result).toEqual(mockPhotoRecord);
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('mock-uuid-1234.jpg'),
      );
      expect(prisma.assessmentPhoto.delete).toHaveBeenCalledWith({
        where: { id: 'photo-1' },
      });
    });

    it('should throw NotFoundException when photo does not exist', async () => {
      prisma.assessmentPhoto.findUnique.mockResolvedValue(null);

      await expect(service.deletePhoto('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should still delete DB record if file is already missing from disk', async () => {
      prisma.assessmentPhoto.findUnique.mockResolvedValue(mockPhotoRecord);
      prisma.assessmentPhoto.delete.mockResolvedValue(mockPhotoRecord);
      (fs.unlink as jest.Mock).mockRejectedValue(
        new Error('ENOENT: no such file'),
      );

      const result = await service.deletePhoto('photo-1');

      expect(result).toEqual(mockPhotoRecord);
      expect(prisma.assessmentPhoto.delete).toHaveBeenCalledWith({
        where: { id: 'photo-1' },
      });
    });
  });
});
