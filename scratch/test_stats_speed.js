const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- Testing Optimized Database Query Latencies ---");

  // 1. Test Admin Stats queries in parallel
  console.time("Admin Stats (Parallel)");
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const NON_ADMIN_MEMBER_FILTER = {
    isOwner: false,
    isAdmin: false,
    role: { notIn: ["OWNER", "Owner", "owner", "ADMIN", "Admin", "admin"] },
  };

  const [totalMembers, activeMembers, todayCheckIns, pendingEnquiries, unreadContact, openComplaints] = await Promise.all([
    prisma.user.count({ where: NON_ADMIN_MEMBER_FILTER }),
    prisma.user.count({ where: { ...NON_ADMIN_MEMBER_FILTER, isActive: true } }),
    prisma.attendance.count({ where: { date: todayStr, status: "Present" } }),
    prisma.enquiry.count({ where: { status: "Pending" } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.complaint.count({ where: { status: "Open" } }),
  ]);
  console.timeEnd("Admin Stats (Parallel)");
  console.log("Admin Stats Result:", { totalMembers, activeMembers, todayCheckIns, pendingEnquiries, unreadContact, openComplaints });

  // 2. Test Owner Stats queries in parallel
  console.time("Owner Stats (Parallel)");
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = now.getFullYear();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const date7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const date15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const date30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const monthRanges = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const mLabel = d.toLocaleString("default", { month: "short" });
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    monthRanges.push({ mStr, mLabel, mStart, mEnd });
  }

  const [
    totalMem,
    activeMem,
    newMem,
    staffCount,
    exp7,
    exp15,
    exp30,
    revToday,
    revWeek,
    revMonth,
    revYear,
    salMonth,
    incMonth,
    rentMonth,
    elecMonth,
    expMonth,
    pendMem,
    pendSal,
    pendInc,
    pendRent,
    pendElec,
    unreadCont,
    ...trendRes
  ] = await Promise.all([
    prisma.user.count({ where: { role: { in: ["MEMBER", ""] }, isOwner: false } }),
    prisma.membership.count({ where: { status: "Active" } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.staff.count({ where: { employmentStatus: "Active" } }),
    prisma.membership.count({ where: { status: "Active", endDate: { gte: now, lte: date7Days } } }),
    prisma.membership.count({ where: { status: "Active", endDate: { gte: now, lte: date15Days } } }),
    prisma.membership.count({ where: { status: "Active", endDate: { gte: now, lte: date30Days } } }),
    prisma.membership.aggregate({ where: { createdAt: { gte: startOfToday } }, _sum: { amountPaid: true } }),
    prisma.membership.aggregate({ where: { createdAt: { gte: startOfWeek } }, _sum: { amountPaid: true } }),
    prisma.membership.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { amountPaid: true } }),
    prisma.membership.aggregate({ where: { createdAt: { gte: startOfYear } }, _sum: { amountPaid: true } }),
    prisma.staffSalary.aggregate({ where: { year: currentYear, month: currentMonth, paymentStatus: "Paid" }, _sum: { totalPayable: true } }),
    prisma.incentive.aggregate({ where: { year: currentYear, month: currentMonth, paymentStatus: "Paid" }, _sum: { amount: true } }),
    prisma.rentPayment.aggregate({ where: { year: currentYear, month: currentMonth, paymentStatus: "Paid" }, _sum: { amountPaid: true } }),
    prisma.electricityBill.aggregate({ where: { year: currentYear, month: currentMonth, paymentStatus: "Paid" }, _sum: { billAmount: true } }),
    prisma.expense.aggregate({ where: { year: currentYear, month: currentMonth, paymentStatus: "Paid" }, _sum: { amount: true } }),
    prisma.membership.count({ where: { remainingBalance: { gt: 0 } } }),
    prisma.staffSalary.count({ where: { paymentStatus: "Pending" } }),
    prisma.incentive.count({ where: { paymentStatus: "Pending" } }),
    prisma.rentPayment.count({ where: { paymentStatus: "Pending" } }),
    prisma.electricityBill.count({ where: { paymentStatus: "Pending" } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    ...monthRanges.flatMap(({ mStr, mStart, mEnd }) => [
      prisma.membership.aggregate({ where: { createdAt: { gte: mStart, lte: mEnd } }, _sum: { amountPaid: true } }),
      prisma.staffSalary.aggregate({ where: { month: mStr }, _sum: { totalPayable: true } }),
      prisma.expense.aggregate({ where: { month: mStr }, _sum: { amount: true } }),
    ]),
  ]);
  console.timeEnd("Owner Stats (Parallel)");
  console.log(`[SUCCESS] Total Members: ${totalMem}, Active: ${activeMem}, Unread Messages: ${unreadCont}`);

  await prisma.$disconnect();
}

main();
