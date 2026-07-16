const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
    const count = await prisma.contactMessage.count();
    console.log(`Total messages in DB: ${count}`);
  } catch (e) {
    console.error('Database connection failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
