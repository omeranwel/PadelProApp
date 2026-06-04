import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing DB connection...');
    const usersCount = await prisma.user.count();
    console.log(`Connection successful! Total users in DB: ${usersCount}`);
  } catch (err) {
    console.error('DB connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
