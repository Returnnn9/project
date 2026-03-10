import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

const passwords = ['postgres', 'admin', 'root', '123456', '1234', 'password', ''];
const user = 'postgres';
const baseDbUrl = 'postgresql://127.0.0.1:5432/smuslest';

async function tryConnect(password: string) {
 const url = `postgresql://${user}:${password}@127.0.0.1:5432/smuslest?connect_timeout=3`;
 const prisma = new PrismaClient({
  datasources: {
   db: { url }
  }
 });

 try {
  await prisma.$connect();
  return true;
 } catch (e) {
  return false;
 } finally {
  await prisma.$disconnect();
 }
}

async function main() {
 console.log('--- Proactive Database Credential Test ---');
 for (const pw of passwords) {
  console.log(`Trying password: "${pw}"...`);
  if (await tryConnect(pw)) {
   console.log(`✅ SUCCESS! Correct password is: "${pw}"`);
   process.exit(0);
  }
 }
 console.log('❌ All common passwords failed.');
 process.exit(1);
}

main();
