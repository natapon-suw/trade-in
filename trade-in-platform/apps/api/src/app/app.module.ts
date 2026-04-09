import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '../config';
import { DatabaseModule } from '../shared/database';
import { ErrorsModule } from '../shared/errors';
import { LoggingModule } from '../shared/logging';
import { AuthModule } from '../shared/auth';
import { AdminModule } from '../modules/admin';

@Module({
  imports: [ConfigModule, DatabaseModule, ErrorsModule, LoggingModule, AuthModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
