import { Environment } from './env.validation';

export interface AppConfig {
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiration: string;
  };
  port: number;
  uploadPath: string;
  nodeEnv: Environment;
}

export const appConfig = (): AppConfig => ({
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiration: process.env.JWT_EXPIRATION ?? '24h',
  },
  port: parseInt(process.env.PORT ?? '3000', 10),
  uploadPath: process.env.UPLOAD_PATH ?? './uploads',
  nodeEnv: (process.env.NODE_ENV as Environment) ?? Environment.Development,
});
