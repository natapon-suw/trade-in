import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProvinceDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
