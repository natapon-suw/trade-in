import { AssessmentStatus } from '@prisma/client';

import {
  NotFoundException,
  UnauthorizedException,
  ValidationException,
} from '../../../shared/errors';
import { QRSessionService } from './qr-session.service';

// Mock qrcode module
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockQRCode'),
}));

describe('QRSessionService', () => {
  let service: QRSessionService;
  let prisma: {
    assessment: { findUnique: jest.Mock };
    qRSession: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let configService: { get: jest.Mock };

  const mockAssessment = {
    id: 'assess-1',
    status: AssessmentStatus.TEST_COMPLETE,
  };

  const mockSession = {
    id: 'session-1',
    assessmentId: 'assess-1',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    isActive: true,
    createdAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      assessment: { findUnique: jest.fn() },
      qRSession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    configService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    service = new QRSessionService(prisma as any, configService as any);
  });

  describe('generateSession', () => {
    it('should create a QR session with 10-minute expiry', async () => {
      prisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      prisma.qRSession.updateMany.mockResolvedValue({ count: 0 });
      prisma.qRSession.create.mockResolvedValue(mockSession);

      const result = await service.generateSession('assess-1');

      expect(result.sessionId).toBe('session-1');
      expect(result.qrCodeDataUrl).toBe('data:image/png;base64,mockQRCode');
      expect(result.expiresAt).toEqual(mockSession.expiresAt);

      // Verify session was created with correct data
      const createCall = prisma.qRSession.create.mock.calls[0][0];
      expect(createCall.data.assessmentId).toBe('assess-1');
      expect(createCall.data.isActive).toBe(true);

      // Verify expiry is approximately 10 minutes from now
      const expiresAt = new Date(createCall.data.expiresAt);
      const expectedExpiry = Date.now() + 10 * 60 * 1000;
      expect(Math.abs(expiresAt.getTime() - expectedExpiry)).toBeLessThan(5000);
    });

    it('should deactivate existing active sessions before creating new one', async () => {
      prisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      prisma.qRSession.updateMany.mockResolvedValue({ count: 1 });
      prisma.qRSession.create.mockResolvedValue(mockSession);

      await service.generateSession('assess-1');

      expect(prisma.qRSession.updateMany).toHaveBeenCalledWith({
        where: { assessmentId: 'assess-1', isActive: true },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException when assessment does not exist', async () => {
      prisma.assessment.findUnique.mockResolvedValue(null);

      await expect(service.generateSession('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ValidationException for invalid assessment status', async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        id: 'assess-1',
        status: AssessmentStatus.MODEL_SELECTED,
      });

      await expect(service.generateSession('assess-1')).rejects.toThrow(
        ValidationException,
      );
    });

    it('should allow session creation from PHOTOS_CAPTURED status', async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        id: 'assess-1',
        status: AssessmentStatus.PHOTOS_CAPTURED,
      });
      prisma.qRSession.updateMany.mockResolvedValue({ count: 0 });
      prisma.qRSession.create.mockResolvedValue(mockSession);

      const result = await service.generateSession('assess-1');

      expect(result.sessionId).toBe('session-1');
    });
  });

  describe('validateSession', () => {
    it('should return session when valid and not expired', async () => {
      prisma.qRSession.findUnique.mockResolvedValue(mockSession);

      const result = await service.validateSession('session-1');

      expect(result).toEqual(mockSession);
      expect(result.assessmentId).toBe('assess-1');
    });

    it('should throw UnauthorizedException for non-existent session', async () => {
      prisma.qRSession.findUnique.mockResolvedValue(null);

      await expect(service.validateSession('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive session', async () => {
      prisma.qRSession.findUnique.mockResolvedValue({
        ...mockSession,
        isActive: false,
      });

      await expect(service.validateSession('session-1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired session', async () => {
      const expiredSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() - 1000), // expired 1 second ago
      };
      prisma.qRSession.findUnique.mockResolvedValue(expiredSession);
      prisma.qRSession.update.mockResolvedValue({
        ...expiredSession,
        isActive: false,
      });

      await expect(service.validateSession('session-1')).rejects.toThrow(
        UnauthorizedException,
      );

      // Should auto-deactivate the expired session
      expect(prisma.qRSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { isActive: false },
      });
    });
  });

  describe('expireSession', () => {
    it('should deactivate the session', async () => {
      prisma.qRSession.update.mockResolvedValue({
        ...mockSession,
        isActive: false,
      });

      await service.expireSession('session-1');

      expect(prisma.qRSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { isActive: false },
      });
    });
  });
});
