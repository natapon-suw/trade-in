import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppLogger } from './app-logger.service';
import { RequestIdMiddleware } from './request-id.middleware';

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
