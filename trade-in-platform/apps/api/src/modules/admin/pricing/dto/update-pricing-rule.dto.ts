import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  AdjustmentType,
  ConditionOperator,
  ConditionType,
  ProductCategory,
} from '@prisma/client';

export class UpdatePricingRuleDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @IsEnum(ConditionType)
  @IsOptional()
  conditionType?: ConditionType;

  @IsEnum(ConditionOperator)
  @IsOptional()
  conditionOperator?: ConditionOperator;

  @IsNumber()
  @IsOptional()
  conditionValue?: number;

  @IsEnum(AdjustmentType)
  @IsOptional()
  adjustmentType?: AdjustmentType;

  @IsNumber()
  @IsOptional()
  adjustmentValue?: number;

  @IsInt()
  @IsOptional()
  priority?: number;
}
