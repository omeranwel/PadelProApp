import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger.js';

const dbEnvKeys = ['DATABASE_URL', 'DIRECT_URL'];
const missingDbEnvKeys = dbEnvKeys.filter((key) => !process.env[key]);
if (missingDbEnvKeys.length > 0) {
  logger.warn({ missingDbEnvKeys }, 'Missing database environment variables. Prisma queries may fail.');
} else {
  logger.info('Database environment variables are present.');
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

export default prisma;
