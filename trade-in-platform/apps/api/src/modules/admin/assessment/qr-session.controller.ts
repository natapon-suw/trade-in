import 'multer';
import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadVia } from '@prisma/client';

import { JwtAuthGuard, Roles, RolesGuard } from '../../../shared/auth';
import { ValidationException } from '../../../shared/errors';
import { PhotoService } from './photo.service';
import { PhotoSyncGateway } from './photo-sync.gateway';
import { QRSessionService } from './qr-session.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Controller()
export class QRSessionController {
  constructor(
    private readonly qrSessionService: QRSessionService,
    private readonly photoService: PhotoService,
    private readonly photoSyncGateway: PhotoSyncGateway,
  ) {}

  @Post('v1/admin/assessments/:id/qr-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin-operation')
  @HttpCode(HttpStatus.CREATED)
  async generateQRSession(@Param('id') assessmentId: string) {
    return this.qrSessionService.generateSession(assessmentId);
  }

  @Post('v1/admin/qr-sessions/:sessionId/photos')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('photo', {
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
  async uploadMobilePhoto(
    @Param('sessionId') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new ValidationException('No file provided');
    }

    // Validate QR session (no JWT needed — session-based auth)
    const session = await this.qrSessionService.validateSession(sessionId);

    // Upload photo via PhotoService with MOBILE upload type
    const photos = await this.photoService.upload(
      session.assessmentId,
      [file],
      UploadVia.MOBILE,
    );

    const photo = photos[0];

    // Notify PC client via WebSocket
    this.photoSyncGateway.notifyPhotoUploaded(session.assessmentId, photo);

    return photo;
  }
}
