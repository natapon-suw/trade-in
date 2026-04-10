import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '@prisma/client';

import { CreateTestStepDto } from './create-test-step.dto';

export class CreateTestGuideDto {
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestStepDto)
  steps: CreateTestStepDto[];
}
