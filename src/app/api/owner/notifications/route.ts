import { prisma } from "@/lib/prisma";
import { requireOwner, apiError, apiResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireOwner();

    const now = new Date();
    const date7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const alerts: Array<{ id: string; category: string; title: string; message: string; severity: string; createdAt: Date; }> = [];

    // 1. Memberships expiring soon
    const expiringMemberships = await prisma.membership.findMany({
      where: { status: "Active", endDate: { gte: now, lte: date7Days } },
      include: { user: { select: { name: true, phone: true } } },
      take: 10
    });
    expiringMemberships.forEach(m => {
      alerts.push({
        id: `mem-${m.id}`,
        category: "MEMBERSHIP",
        title: "Membership Expiring Soon",
        message: `${m.user.name}'s ${m.plan} subscription expires on ${new Date(m.endDate).toLocaleDateString()}.`,
        severity: "warning",
        createdAt: m.createdAt,
      });
    });

    // 2. Pending Salaries
    const pendingSalaries = await prisma.staffSalary.findMany({
      where: { paymentStatus: "Pending" },
      include: { staff: { select: { name: true } } },
      take: 10
    });
    pendingSalaries.forEach(s => {
      alerts.push({
        id: `sal-${s.id}`,
        category: "SALARY",
        title: "Pending Staff Salary",
        message: `Salary payout of ₹${s.totalPayable} for ${s.staff.name} (${s.month}) is pending.`,
        severity: "important",
        createdAt: s.createdAt,
      });
    });

    // 3. Rent Due
    const pendingRent = await prisma.rentPayment.findMany({
      where: { paymentStatus: "Pending" },
      take: 5
    });
    pendingRent.forEach(r => {
      alerts.push({
        id: `rent-${r.id}`,
        category: "RENT",
        title: "Gym Rent Due",
        message: `Rent for ${r.month} (₹${r.monthlyRent}) is pending payment.`,
        severity: "important",
        createdAt: r.createdAt,
      });
    });

    // 4. Electricity Bill Due
    const pendingElectricity = await prisma.electricityBill.findMany({
      where: { paymentStatus: "Pending" },
      take: 5
    });
    pendingElectricity.forEach(e => {
      alerts.push({
        id: `elec-${e.id}`,
        category: "ELECTRICITY",
        title: "Electricity Bill Due",
        message: `Electricity bill for ${e.month} (₹${e.billAmount}) is pending. Due date: ${new Date(e.dueDate).toLocaleDateString()}`,
        severity: "warning",
        createdAt: e.createdAt,
      });
    });

    return apiResponse(alerts);
  } catch (error) {
    console.error("[OWNER_NOTIFICATIONS_GET]", error);
    return apiError("Internal server error", 500);
  }
}
