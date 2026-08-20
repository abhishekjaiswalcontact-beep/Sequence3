const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- Starting Contact Us Database Integration Test ---");

  try {
    // 1. Check initial count
    const initialUnread = await prisma.contactMessage.count({
      where: { isRead: false },
    });
    console.log(`[PASS] Initial unread contact messages count: ${initialUnread}`);

    // 2. Insert test submission
    const testMsg = await prisma.contactMessage.create({
      data: {
        name: "Rohit Sharma",
        email: "rohit.test@pinakagym.com",
        phone: "9876543210",
        subject: "Personal Training Inquiry",
        message: "Hello, I want to know about Personal Training packages and timings.",
        isRead: false,
        status: "Unread",
      },
    });

    console.log(`[PASS] Test contact message created with ID: ${testMsg.id}`);
    console.log(`       Name: ${testMsg.name}, Email: ${testMsg.email}, Phone: ${testMsg.phone}`);
    console.log(`       Subject: ${testMsg.subject}, isRead: ${testMsg.isRead}, status: ${testMsg.status}`);

    // 3. Verify unread count increased
    const afterInsertUnread = await prisma.contactMessage.count({
      where: { isRead: false },
    });
    console.log(`[PASS] Unread count after creation: ${afterInsertUnread} (expected: ${initialUnread + 1})`);
    if (afterInsertUnread !== initialUnread + 1) {
      throw new Error("Unread count did not increment as expected!");
    }

    // 4. Test status update / mark as read
    const updated = await prisma.contactMessage.update({
      where: { id: testMsg.id },
      data: { isRead: true, status: "Read" },
    });
    console.log(`[PASS] Message updated: isRead=${updated.isRead}, status=${updated.status}`);

    // 5. Verify unread count decreased back
    const afterReadUnread = await prisma.contactMessage.count({
      where: { isRead: false },
    });
    console.log(`[PASS] Unread count after marking read: ${afterReadUnread} (expected: ${initialUnread})`);
    if (afterReadUnread !== initialUnread) {
      throw new Error("Unread count did not decrement back!");
    }

    // 6. Test delete
    await prisma.contactMessage.delete({
      where: { id: testMsg.id },
    });
    console.log(`[PASS] Test message successfully deleted.`);

    console.log("\n>>> ALL TESTS COMPLETED SUCCESSFULLY! REAL DATABASE FLOW FULLY OPERATIONAL. <<<");
  } catch (err) {
    console.error("[FAIL] Error during testing:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
