import { Module } from '@nestjs/common';

import { DefectChecklistController } from './defect-checklist.controller';
import { DefectChecklistService } from './defect-checklist.service';
import { ProductModelController } from './product-model.controller';
import { ProductModelService } from './product-model.service';
import { TestGuideController } from './test-guide.controller';
import { TestGuideService } from './test-guide.service';

@Module({
  controllers: [ProductModelController, TestGuideController, DefectChecklistController],
  providers: [ProductModelService, TestGuideService, DefectChecklistService],
  exports: [ProductModelService, TestGuideService, DefectChecklistService],
})
export class CatalogModule {}
