import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

// Prevent multiple instances in dev with HMR
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; adapter?: PrismaPg };

const adapter = globalForPrisma.adapter || new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.adapter = adapter;
}

export default prisma;
