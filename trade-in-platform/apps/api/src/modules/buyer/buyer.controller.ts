import { Controller, Get, Param, Query } from '@nestjs/common';

import { BuyerService } from './buyer.service';
import { BrowseFilterDto } from './dto/browse-filter.dto';

@Controller('v1/buyer')
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  @Get('products')
  async listProducts(@Query() filter: BrowseFilterDto) {
    return this.buyerService.listProducts(
      filter.category,
      filter.page,
      filter.pageSize,
    );
  }

  @Get('products/:id')
  async getProductDetail(@Param('id') id: string) {
    return this.buyerService.getProductDetail(id);
  }
}
