import 'multer';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadVia } from '@prisma/client';

import { JwtAuthGuard, Roles, RolesGuard } from '../../../shared/auth';
import { ValidationException } from '../../../shared/errors';
import { PhotoService } from './photo.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Controller('v1/admin/assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post(':id/photos')
  @Roles('admin-operation')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new ValidationException(
              `Invalid file format: ${file.mimetype}. Allowed: JPEG, PNG, WebP`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new ValidationException('No files provided');
    }
    return this.photoService.upload(id, files, UploadVia.PC);
  }

  @Get(':id/photos')
  @Roles('admin-operation', 'admin-manager')
  @HttpCode(HttpStatus.OK)
  async listPhotos(@Param('id') id: string) {
    return this.photoService.findByAssessment(id);
  }

  @Delete(':id/photos/:photoId')
  @Roles('admin-operation')
  @HttpCode(HttpStatus.OK)
  async deletePhoto(@Param('photoId') photoId: string) {
    return this.photoService.deletePhoto(photoId);
  }
}
