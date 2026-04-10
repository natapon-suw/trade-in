import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
  migrations: {
    seed: `ts-node --compiler-options {"module":"CommonJS"} ${path.join(__dirname, 'seed.ts')}`,
  },
});
