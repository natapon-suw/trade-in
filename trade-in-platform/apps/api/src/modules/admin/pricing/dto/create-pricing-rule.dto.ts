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

export class CreatePricingRuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @IsEnum(ConditionType)
  conditionType: ConditionType;

  @IsEnum(ConditionOperator)
  conditionOperator: ConditionOperator;

  @IsNumber()
  conditionValue: number;

  @IsEnum(AdjustmentType)
  adjustmentType: AdjustmentType;

  @IsNumber()
  adjustmentValue: number;

  @IsInt()
  @IsOptional()
  priority?: number = 0;
}
