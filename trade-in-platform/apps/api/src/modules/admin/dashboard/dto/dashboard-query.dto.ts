import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class DashboardQueryDto {
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;
}
