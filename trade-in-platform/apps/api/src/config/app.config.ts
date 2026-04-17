import { Environment } from './env.validation';

export interface AppConfig {
  database: {
    url: string;
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  jwt: {
    secret: string;
    expiration: string;
  };
  port: number;
  uploadPath: string;
  nodeEnv: Environment;
  appUrl: string;
}

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '3306', 10),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    name: parsed.pathname.replace(/^\//, ''),
  };
}

export const appConfig = (): AppConfig => {
  const databaseUrl = process.env.DATABASE_URL ?? '';
  const dbParts = parseDatabaseUrl(databaseUrl);

  return {
    database: {
      url: databaseUrl,
      ...dbParts,
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? '',
      expiration: process.env.JWT_EXPIRATION ?? '24h',
    },
    port: parseInt(process.env.PORT ?? '3000', 10),
    uploadPath: process.env.UPLOAD_PATH ?? './uploads',
    nodeEnv: (process.env.NODE_ENV as Environment) ?? Environment.Development,
    appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  };
};
