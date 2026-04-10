import { IsEmail, IsString } from 'class-validator';

export class LoginSellerDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
