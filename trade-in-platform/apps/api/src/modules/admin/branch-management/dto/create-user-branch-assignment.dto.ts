import { IsUUID } from 'class-validator';

export class CreateUserBranchAssignmentDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  branchId: string;
}
