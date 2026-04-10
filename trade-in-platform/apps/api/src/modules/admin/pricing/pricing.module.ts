import { Module } from '@nestjs/common';

import { PricingRuleController } from './pricing-rule.controller';
import { PricingRuleService } from './pricing-rule.service';
import { PricingService } from './pricing.service';

@Module({
  controllers: [PricingRuleController],
  providers: [PricingRuleService, PricingService],
  exports: [PricingRuleService, PricingService],
})
export class PricingModule {}
