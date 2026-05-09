import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
 prisma: PrismaClient | undefined;
};

const getPrisma = (): PrismaClient => {
 if (!globalForPrisma.prisma) {
  if (process.env.NODE_ENV !== 'production') {
   const url = process.env.DATABASE_URL || 'UNDEFINED';
   const maskedUrl = url.replace(/:([^@]+)@/, ':***@');
   console.log(`[Prisma] Initializing with URL: ${maskedUrl}`);
  }
  globalForPrisma.prisma = new PrismaClient();
 }
 return globalForPrisma.prisma;
};

export const prisma = new Proxy({} as PrismaClient, {
 get: (target, prop) => {
  if (prop === '$$typeof' || prop === 'constructor') return Reflect.get(target, prop);
  return Reflect.get(getPrisma(), prop as string | symbol);
 }
});
