import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssessmentStatus } from '@prisma/client';
import * as QRCode from 'qrcode';

import { PrismaService } from '../../../shared/database';
import {
  NotFoundException,
  UnauthorizedException,
  ValidationException,
} from '../../../shared/errors';

const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const ALLOWED_STATUSES: AssessmentStatus[] = [
  AssessmentStatus.TEST_COMPLETE,
  AssessmentStatus.PHOTOS_CAPTURED,
];

@Injectable()
export class QRSessionService {
  private readonly appUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.appUrl = this.configService.get<string>('appUrl') ?? 'http://localhost:3000';
  }

  async generateSession(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (!ALLOWED_STATUSES.includes(assessment.status)) {
      throw new ValidationException(
        `Cannot create QR session from status ${assessment.status}. Assessment must be in TEST_COMPLETE or PHOTOS_CAPTURED status.`,
      );
    }

    // Deactivate any existing active sessions for this assessment
    await this.prisma.qRSession.updateMany({
      where: { assessmentId, isActive: true },
      data: { isActive: false },
    });

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    const session = await this.prisma.qRSession.create({
      data: {
        assessmentId,
        expiresAt,
        isActive: true,
      },
    });

    const mobileUrl = `${this.appUrl}/qr/${session.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(mobileUrl);

    return {
      sessionId: session.id,
      qrCodeDataUrl,
      expiresAt: session.expiresAt,
    };
  }

  async validateSession(sessionId: string) {
    const session = await this.prisma.qRSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid QR session');
    }

    if (!session.isActive) {
      throw new UnauthorizedException('QR session is no longer active');
    }

    if (new Date() > session.expiresAt) {
      // Auto-deactivate expired session
      await this.prisma.qRSession.update({
        where: { id: sessionId },
        data: { isActive: false },
      });
      throw new UnauthorizedException('QR session has expired');
    }

    return session;
  }

  async expireSession(sessionId: string) {
    await this.prisma.qRSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }
}
