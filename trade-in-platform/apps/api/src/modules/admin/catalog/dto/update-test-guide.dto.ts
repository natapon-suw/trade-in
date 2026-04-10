import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateTestStepDto } from './create-test-step.dto';

export class UpdateTestGuideDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestStepDto)
  @IsOptional()
  steps?: CreateTestStepDto[];
}
