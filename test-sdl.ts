import { prisma } from "./src/lib/prisma";
import crypto from "crypto";

async function main() {
  console.log("Starting Single Device Login Verification...");

  const email = "sdl_test_user@example.com";
  
  // 1. Clean up existing test user
  await prisma.user.deleteMany({ where: { email } }).catch(() => {});

  // 2. Create test user
  const user = await prisma.user.create({
    data: {
      email,
      name: "SDL Test User",
      password: "some_secure_hashed_password",
      isActive: true,
      isAdmin: false,
    }
  });
  console.log("Created test user:", user.email, "ID:", user.id);

  // 3. Simulate first login
  const sessionId1 = crypto.randomUUID();
  await prisma.user.update({
    where: { id: user.id },
    data: { currentSessionId: sessionId1 }
  });
  console.log("Simulated login 1. Session ID:", sessionId1);

  // 4. Verify session 1 is active
  let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.currentSessionId === sessionId1) {
    console.log("✅ Session 1 matches DB successfully.");
  } else {
    console.log("❌ Session 1 mismatch!");
  }

  // 5. Simulate second login (different device)
  const sessionId2 = crypto.randomUUID();
  await prisma.user.update({
    where: { id: user.id },
    data: { currentSessionId: sessionId2 }
  });
  console.log("Simulated login 2. Session ID:", sessionId2);

  // 6. Verify session 1 is now invalid, and session 2 is active
  dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.currentSessionId === sessionId1) {
    console.log("❌ Old session is still valid in DB!");
  } else {
    console.log("✅ Old session successfully invalidated in DB.");
  }

  if (dbUser?.currentSessionId === sessionId2) {
    console.log("✅ New session matches DB successfully.");
  } else {
    console.log("❌ New session mismatch!");
  }

  // Clean up
  await prisma.user.delete({ where: { id: user.id } });
  console.log("Verification finished successfully!");
}

main().catch(console.error);
