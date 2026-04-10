import { IsUUID } from 'class-validator';

export class CreateAssessmentDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  productModelId: string;
}
