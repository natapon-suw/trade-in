import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateProvinceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  countryId: string;
}
