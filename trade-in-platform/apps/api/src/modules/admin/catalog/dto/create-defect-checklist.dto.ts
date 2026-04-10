import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '@prisma/client';

import { CreateDefectItemDto } from './create-defect-item.dto';

export class CreateDefectChecklistDto {
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDefectItemDto)
  items: CreateDefectItemDto[];
}
