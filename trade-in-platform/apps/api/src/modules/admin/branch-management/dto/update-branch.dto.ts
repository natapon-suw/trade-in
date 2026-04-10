import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBranchDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;
}
