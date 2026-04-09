import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '../config';
import { DatabaseModule } from '../shared/database';
import { ErrorsModule } from '../shared/errors';
import { LoggingModule } from '../shared/logging';
import { AuthModule } from '../shared/auth';

@Module({
  imports: [ConfigModule, DatabaseModule, ErrorsModule, LoggingModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
