import 'multer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssessmentStatus, UploadVia } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

import { PrismaService } from '../../../shared/database';
import {
  NotFoundException,
  ValidationException,
} from '../../../shared/errors';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UPLOADABLE_STATUSES: AssessmentStatus[] = [
  AssessmentStatus.TEST_COMPLETE,
  AssessmentStatus.PHOTOS_CAPTURED,
];

@Injectable()
export class PhotoService {
  private readonly uploadPath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads');
  }

  async upload(
    assessmentId: string,
    files: Express.Multer.File[],
    uploadedVia: UploadVia,
  ) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (!UPLOADABLE_STATUSES.includes(assessment.status)) {
      throw new ValidationException(
        `Cannot upload photos from status ${assessment.status}`,
      );
    }

    const assessmentDir = path.join(this.uploadPath, assessmentId);
    await fs.mkdir(assessmentDir, { recursive: true });

    const photoRecords = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new ValidationException(
          `Invalid file format: ${file.mimetype}. Allowed: JPEG, PNG, WebP`,
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new ValidationException(
          `File too large: ${file.originalname}. Maximum size is 10MB`,
        );
      }

      const ext = path.extname(file.originalname).toLowerCase() || this.getExtFromMime(file.mimetype);
      const filename = `${randomUUID()}${ext}`;
      const filePath = path.join(assessmentDir, filename);

      await fs.writeFile(filePath, file.buffer);

      const photo = await this.prisma.assessmentPhoto.create({
        data: {
          assessmentId,
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          uploadedVia,
        },
      });

      photoRecords.push(photo);
    }

    // Update status to PHOTOS_CAPTURED on first upload
    if (assessment.status === AssessmentStatus.TEST_COMPLETE) {
      await this.prisma.assessment.update({
        where: { id: assessmentId },
        data: { status: AssessmentStatus.PHOTOS_CAPTURED },
      });
    }

    return photoRecords;
  }

  async findByAssessment(assessmentId: string) {
    return this.prisma.assessmentPhoto.findMany({
      where: { assessmentId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deletePhoto(id: string) {
    const photo = await this.prisma.assessmentPhoto.findUnique({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    const filePath = path.join(
      this.uploadPath,
      photo.assessmentId,
      photo.filename,
    );

    try {
      await fs.unlink(filePath);
    } catch {
      // File may already be deleted from disk — continue with DB cleanup
    }

    await this.prisma.assessmentPhoto.delete({ where: { id } });

    return photo;
  }

  async ensureUploadDir() {
    await fs.mkdir(this.uploadPath, { recursive: true });
  }

  private getExtFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    return map[mimeType] ?? '.bin';
  }
}
