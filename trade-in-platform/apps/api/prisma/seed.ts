import * as path from 'path';
import * as dotenv from 'dotenv';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const BCRYPT_ROUNDS = 10;

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@tradein.local',
    password: 'Admin123!',
    name: 'Admin Operation',
    role: UserRole.ADMIN_OPERATION,
  },
  {
    email: 'manager@tradein.local',
    password: 'Manager123!',
    name: 'Admin Manager',
    role: UserRole.ADMIN_MANAGER,
  },
  {
    email: 'seller@tradein.local',
    password: 'Seller123!',
    name: 'Test Seller',
    role: UserRole.SELLER,
  },
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('🌱 Seeding database...');

  for (const userData of SEED_USERS) {
    const passwordHash = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        role: userData.role,
        passwordHash,
      },
      create: {
        email: userData.email,
        passwordHash,
        name: userData.name,
        role: userData.role,
      },
    });

    console.log(`  ✓ ${user.role}: ${user.email} (${user.id})`);
  }

  console.log('🌱 Seeding complete.');
}

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    log: ['warn', 'error'],
  });

  try {
    await seed(prisma);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/* istanbul ignore next -- only runs when executed directly */
if (require.main === module) {
  main();
}
