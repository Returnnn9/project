import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    console.log('✅ Connection successful')
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
  } catch (e) {
    console.error('❌ Connection failed')
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
