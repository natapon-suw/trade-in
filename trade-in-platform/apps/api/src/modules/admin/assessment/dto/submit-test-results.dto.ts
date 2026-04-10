import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class TestResultItemDto {
  @IsUUID()
  testStepId: string;

  @IsBoolean()
  passed: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class SubmitTestResultsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestResultItemDto)
  results: TestResultItemDto[];
}
