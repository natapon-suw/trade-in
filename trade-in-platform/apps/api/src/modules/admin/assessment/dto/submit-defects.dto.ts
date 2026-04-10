import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class DefectItemDto {
  @IsUUID()
  defectItemId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  severity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class SubmitDefectsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefectItemDto)
  defects: DefectItemDto[];
}
