import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class PriceOverrideDto {
  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
