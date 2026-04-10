import { IsDateString, IsOptional } from 'class-validator';

export class DashboardQueryDto {
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
