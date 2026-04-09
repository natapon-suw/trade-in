import { Module } from '@nestjs/common';

import { AdminAuthModule } from './auth/auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AdminModule {}
