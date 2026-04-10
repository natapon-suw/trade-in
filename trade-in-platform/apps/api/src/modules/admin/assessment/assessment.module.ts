import { Module } from '@nestjs/common';

import { BranchManagementModule } from '../branch-management/branch-management.module';
import { PricingModule } from '../pricing/pricing.module';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { PhotoSyncGateway } from './photo-sync.gateway';
import { QRSessionController } from './qr-session.controller';
import { QRSessionService } from './qr-session.service';

@Module({
  imports: [PricingModule, BranchManagementModule],
  controllers: [AssessmentController, PhotoController, QRSessionController],
  providers: [
    AssessmentService,
    PhotoService,
    QRSessionService,
    PhotoSyncGateway,
  ],
  exports: [AssessmentService, PhotoService, QRSessionService],
})
export class AssessmentModule {}
