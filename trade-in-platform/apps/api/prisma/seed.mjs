import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

// Use mysql2 directly to avoid Prisma client engine issues
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

// bcrypt is CJS, use createRequire
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

const SEED_USERS = [
  { email: 'admin@tradein.local', password: 'Admin123!', name: 'Admin Operation', role: 'ADMIN_OPERATION' },
  { email: 'manager@tradein.local', password: 'Manager123!', name: 'Admin Manager', role: 'ADMIN_MANAGER' },
  { email: 'seller@tradein.local', password: 'Seller123!', name: 'Test Seller', role: 'SELLER' },
];

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log('🌱 Seeding database...');

  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const id = crypto.randomUUID();

    // Upsert: insert or update on duplicate email
    await connection.execute(
      `INSERT INTO users (id, email, passwordHash, name, role, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), passwordHash = VALUES(passwordHash), updatedAt = NOW()`,
      [id, user.email, passwordHash, user.name, user.role]
    );
    console.log(`  ✓ ${user.role}: ${user.email}`);
  }

  await connection.end();
  console.log('🌱 Seeding complete.');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
