import { Module } from '@nestjs/common';

import { AdminAuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [AdminAuthModule, CatalogModule, CustomerModule],
  controllers: [],
  providers: [],
  exports: [CatalogModule, CustomerModule],
})
export class AdminModule {}
