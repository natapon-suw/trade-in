/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Static file serving for uploaded photos
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  const resolvedUploadPath = path.resolve(uploadPath);
  if (!fs.existsSync(resolvedUploadPath)) {
    fs.mkdirSync(resolvedUploadPath, { recursive: true });
  }
  app.use('/uploads', express.static(resolvedUploadPath));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
