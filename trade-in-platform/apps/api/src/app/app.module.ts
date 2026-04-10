import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '../config';
import { DatabaseModule } from '../shared/database';
import { ErrorsModule } from '../shared/errors';
import { LoggingModule } from '../shared/logging';
import { AuthModule } from '../shared/auth';
import { AdminModule } from '../modules/admin';
import { SellerModule } from '../modules/seller';
import { BuyerModule } from '../modules/buyer';

@Module({
  imports: [ConfigModule, DatabaseModule, ErrorsModule, LoggingModule, AuthModule, AdminModule, SellerModule, BuyerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
