import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsUUID()
  provinceId: string;
}
