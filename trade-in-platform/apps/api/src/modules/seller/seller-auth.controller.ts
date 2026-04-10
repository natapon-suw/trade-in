import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from '../../shared/auth';
import { PrismaService } from '../../shared/database';
import { ConflictException } from '../../shared/errors';
import { LoginSellerDto } from './dto/login-seller.dto';
import { RegisterSellerDto } from './dto/register-seller.dto';

@Controller('v1/seller/auth')
export class SellerAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginSellerDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  async register(@Body() dto: RegisterSellerDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.authService.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'SELLER',
      },
    });

    return { id: user.id, email: user.email, name: user.name };
  }
}
