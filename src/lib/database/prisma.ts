import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

// 使用 HMR 防止开发时出现多个实例
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; adapter?: PrismaPg };

const adapter = globalForPrisma.adapter || new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.adapter = adapter;
}

export default prisma;
