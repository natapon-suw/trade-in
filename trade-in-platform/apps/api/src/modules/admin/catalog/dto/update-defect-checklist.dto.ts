import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateDefectItemDto } from './create-defect-item.dto';

export class UpdateDefectChecklistDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDefectItemDto)
  @IsOptional()
  items?: CreateDefectItemDto[];
}
