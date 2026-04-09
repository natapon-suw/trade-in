import { IsOptional, IsString } from 'class-validator';

export class SearchCustomerDto {
  @IsString()
  @IsOptional()
  search?: string;
}
