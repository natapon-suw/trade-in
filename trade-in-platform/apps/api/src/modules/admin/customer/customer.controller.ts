import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard, RolesGuard, Roles } from '../../../shared/auth';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SearchCustomerDto } from './dto/search-customer.dto';

@Controller('v1/admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin-operation', 'admin-manager')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async search(@Query() dto: SearchCustomerDto) {
    return this.customerService.search(dto.search);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }
}
