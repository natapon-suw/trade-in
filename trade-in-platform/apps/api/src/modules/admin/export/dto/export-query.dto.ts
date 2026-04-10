import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class ExportStockQueryDto {
  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;
}

export class ExportAssessmentsQueryDto {
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
