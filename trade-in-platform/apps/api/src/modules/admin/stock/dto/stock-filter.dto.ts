import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ProductCategory, StockStatus } from '@prisma/client';

export class StockFilterDto {
  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @IsEnum(StockStatus)
  @IsOptional()
  status?: StockStatus;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priceMin?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priceMax?: number;

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 20;
}
