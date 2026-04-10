import { IsOptional, IsUUID } from 'class-validator';

export class CreateAssessmentDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  productModelId: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;
}
