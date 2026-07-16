import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const contact = await prisma.contactMessage.create({
      data: {
        name: "test",
        email: "test@example.com",
        phone: "1234567890",
        message: "hello prisma",
      },
    });
    console.log("Success:", contact);
  } catch (error) {
    console.error("Prisma error:", error);
  }
}

main();
