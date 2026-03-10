import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force load .env from root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
 const dbUrl = process.env.DATABASE_URL || 'NOT DEFINED';
 console.log('--- Database Connection Test ---');
 console.log('DATABASE_URL:', dbUrl.replace(/:.*@/, ':****@').replace(/localhost/, '127.0.0.1'));

 try {
  console.log('Attempting to connect...');
  await prisma.$connect();
  console.log('✅ Database connection successful!');

  // Try a simple query
  const userCount = await prisma.user.count();
  console.log(`✅ Query successful! User count: ${userCount}`);
 } catch (error: any) {
  console.error('❌ Database connection failed!');
  console.error('Error Code:', error.code);
  console.error('Message:', error.message);

  if (error.code === 'P1000') {
   console.log('\nHINT: Authentication failed. This means the user or password in your DATABASE_URL is incorrect.');
   console.log('Current URL in .env suggests user: "postgres" and password: "postgres".');
  }
 } finally {
  await prisma.$disconnect();
 }
}

main();
