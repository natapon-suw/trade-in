import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { PriceCheckDto } from './dto/price-check.dto';
import { SellerPriceCheckService } from './seller-price-check.service';

@Controller('v1/seller')
export class SellerPriceCheckController {
  constructor(private readonly priceCheckService: SellerPriceCheckService) {}

  @Get('product-models')
  async getProductModels(@Query('search') search?: string) {
    return this.priceCheckService.searchModels(search);
  }

  @Post('price-check')
  async checkPrice(@Body() dto: PriceCheckDto) {
    return this.priceCheckService.checkPrice(dto);
  }
}
