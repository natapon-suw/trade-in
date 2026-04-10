import { Module } from '@nestjs/common';

import { AssessmentModule } from './assessment/assessment.module';
import { AdminAuthModule } from './auth/auth.module';
import { BranchManagementModule } from './branch-management/branch-management.module';
import { CatalogModule } from './catalog/catalog.module';
import { CustomerModule } from './customer/customer.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExportModule } from './export/export.module';
import { PricingModule } from './pricing/pricing.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [AdminAuthModule, AssessmentModule, BranchManagementModule, CatalogModule, CustomerModule, DashboardModule, ExportModule, PricingModule, StockModule],
  controllers: [],
  providers: [],
  exports: [AssessmentModule, BranchManagementModule, CatalogModule, CustomerModule, PricingModule, StockModule],
})
export class AdminModule {}
