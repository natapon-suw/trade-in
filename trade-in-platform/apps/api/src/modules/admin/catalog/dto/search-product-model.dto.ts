import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class SearchProductModelDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @IsString()
  @IsOptional()
  includeInactive?: string;
}
