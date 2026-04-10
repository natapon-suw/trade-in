import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class DefectInputDto {
  @IsString()
  defectItemId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  severity: number;
}

export class PriceCheckDto {
  @IsUUID()
  productModelId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefectInputDto)
  defects: DefectInputDto[];
}
