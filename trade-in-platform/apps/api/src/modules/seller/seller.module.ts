import { Module } from '@nestjs/common';

import { SellerAuthController } from './seller-auth.controller';
import { SellerPriceCheckController } from './seller-price-check.controller';
import { SellerPriceCheckService } from './seller-price-check.service';

@Module({
  controllers: [SellerAuthController, SellerPriceCheckController],
  providers: [SellerPriceCheckService],
})
export class SellerModule {}
