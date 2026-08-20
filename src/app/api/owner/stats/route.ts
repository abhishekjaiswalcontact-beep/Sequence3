import { prisma } from "@/lib/prisma";
import { requireOwner, apiError, apiResponse } from "@/lib/auth";

export const runtime = "nodejs";

// In-memory cache with 15s TTL for ultra-fast response
interface CacheEntry {
  data: unknown;
  timestamp: number;
}
let statsCache: CacheEntry | null = null;
const CACHE_TTL_MS = 15000;

export async function GET() {
  try {
    await requireOwner();

    const now = new Date();

    // Check cache
    if (statsCache && now.getTime() - statsCache.timestamp < CACHE_TTL_MS) {
      return apiResponse(statsCache.data);
    }

    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentYear = now.getFullYear();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const date7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const date15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const date30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Prepare 6 monthly trend queries array
    const monthRanges = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const mLabel = d.toLocaleString("default", { month: "short" });
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      monthRanges.push({ mStr, mLabel, mStart, mEnd });
    }

    // Execute ALL database queries in PARALLEL via Promise.all
    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      totalStaff,
      expiringIn7Days,
      expiringIn15Days,
      expiringIn30Days,
      todayRevenueAgg,
      customRevenueToday,
      weekRevenueAgg,
      customRevenueWeek,
      monthRevenueAgg,
      customRevenueMonth,
      yearRevenueAgg,
      customRevenueYear,
      monthSalariesAgg,
      monthIncentivesAgg,
      monthRentAgg,
      monthElecAgg,
      monthExpensesAgg,
      pendingMembershipPayments,
      pendingSalaries,
      pendingIncentives,
      pendingRent,
      pendingElectricity,
      unreadContactMessages,
      ...monthlyTrendsResults
    ] = await Promise.all([
      // 1-7: Member & Staff KPIs
      prisma.user.count({ where: { role: { in: ["MEMBER", ""] }, isOwner: false } }),
      prisma.membership.count({ where: { status: "Active" } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.staff.count({ where: { employmentStatus: "Active" } }),
      prisma.membership.count({ where: { status: "Active", endDate: { gte: now, lte: date7Days } } }),
      prisma.membership.count({ where: { status: "Active", endDate: { gte: now, lte: date15Days } } }),
      prisma.membership.count({ where: { status: "Active", endDate: { gte: now, lte: date30Days } } }),

      // 8-15: Revenues
      prisma.membership.aggregate({ where: { createdAt: { gte: startOfToday } }, _sum: { amountPaid: true } }),
      prisma.gymRevenue.aggregate({ where: { date: { gte: startOfToday } }, _sum: { amount: true } }),
      prisma.membership.aggregate({ where: { createdAt: { gte: startOfWeek } }, _sum: { amountPaid: true } }),
      prisma.gymRevenue.aggregate({ where: { date: { gte: startOfWeek } }, _sum: { amount: true } }),
      prisma.membership.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { amountPaid: true } }),
      prisma.gymRevenue.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.membership.aggregate({ where: { createdAt: { gte: startOfYear } }, _sum: { amountPaid: true } }),
      prisma.gymRevenue.aggregate({ where: { date: { gte: startOfYear } }, _sum: { amount: true } }),

      // 16-20: Expenses
      prisma.staffSalary.aggregate({ where: { year: currentYear, month: currentMonth, paymentStatus: "Paid" }, _sum: { totalPayable: true } }),
      prisma.incentive.aggregate({ where: { year: currentYear, month: currentMonth, paymentStatus: "Paid" }, _sum: { amount: true } }),
      prisma.rentPayment.aggregate({ where: { year: currentYear, month: currentMonth, paymentStatus: "Paid" }, _sum: { amountPaid: true } }),
      prisma.electricityBill.aggregate({ where: { year: currentYear, month: currentMonth, paymentStatus: "Paid" }, _sum: { billAmount: true } }),
      prisma.expense.aggregate({ where: { year: currentYear, month: currentMonth, paymentStatus: "Paid" }, _sum: { amount: true } }),

      // 21-26: Pending & Unread counts
      prisma.membership.count({ where: { remainingBalance: { gt: 0 } } }),
      prisma.staffSalary.count({ where: { paymentStatus: "Pending" } }),
      prisma.incentive.count({ where: { paymentStatus: "Pending" } }),
      prisma.rentPayment.count({ where: { paymentStatus: "Pending" } }),
      prisma.electricityBill.count({ where: { paymentStatus: "Pending" } }),
      prisma.contactMessage.count({ where: { isRead: false } }),

      // 27+: 6 months * 6 aggregates concurrently
      ...monthRanges.flatMap(({ mStr, mStart, mEnd }) => [
        prisma.membership.aggregate({ where: { createdAt: { gte: mStart, lte: mEnd } }, _sum: { amountPaid: true } }),
        prisma.gymRevenue.aggregate({ where: { date: { gte: mStart, lte: mEnd } }, _sum: { amount: true } }),
        prisma.staffSalary.aggregate({ where: { month: mStr }, _sum: { totalPayable: true } }),
        prisma.rentPayment.aggregate({ where: { month: mStr }, _sum: { amountPaid: true } }),
        prisma.electricityBill.aggregate({ where: { month: mStr }, _sum: { billAmount: true } }),
        prisma.expense.aggregate({ where: { month: mStr }, _sum: { amount: true } }),
      ]),
    ]);

    const todayRevenue = (todayRevenueAgg._sum.amountPaid || 0) + (customRevenueToday._sum.amount || 0);
    const weekRevenue = (weekRevenueAgg._sum.amountPaid || 0) + (customRevenueWeek._sum.amount || 0);
    const monthRevenue = (monthRevenueAgg._sum.amountPaid || 0) + (customRevenueMonth._sum.amount || 0);
    const yearRevenue = (yearRevenueAgg._sum.amountPaid || 0) + (customRevenueYear._sum.amount || 0);

    const monthlyExpenses =
      (monthSalariesAgg._sum.totalPayable || 0) +
      (monthIncentivesAgg._sum.amount || 0) +
      (monthRentAgg._sum.amountPaid || 0) +
      (monthElecAgg._sum.billAmount || 0) +
      (monthExpensesAgg._sum.amount || 0);

    const monthlyProfit = monthRevenue - monthlyExpenses;

    // Process monthly trends
    const monthlyTrends = [];
    for (let i = 0; i < monthRanges.length; i++) {
      const { mLabel } = monthRanges[i];
      const offset = i * 6;
      const revMem = (monthlyTrendsResults[offset] as { _sum: { amountPaid: number | null } })?._sum?.amountPaid || 0;
      const revCust = (monthlyTrendsResults[offset + 1] as { _sum: { amount: number | null } })?._sum?.amount || 0;
      const expSal = (monthlyTrendsResults[offset + 2] as { _sum: { totalPayable: number | null } })?._sum?.totalPayable || 0;
      const expRent = (monthlyTrendsResults[offset + 3] as { _sum: { amountPaid: number | null } })?._sum?.amountPaid || 0;
      const expElec = (monthlyTrendsResults[offset + 4] as { _sum: { billAmount: number | null } })?._sum?.billAmount || 0;
      const expGen = (monthlyTrendsResults[offset + 5] as { _sum: { amount: number | null } })?._sum?.amount || 0;

      const revTotal = revMem + revCust;
      const expTotal = expSal + expRent + expElec + expGen;

      monthlyTrends.push({
        month: mLabel,
        revenue: revTotal,
        expenses: expTotal,
        profit: revTotal - expTotal,
      });
    }

    // Alerts
    const alerts = [];
    if (unreadContactMessages > 0) {
      alerts.push({ id: "contact-unread", type: "info", message: `${unreadContactMessages} new website contact message${unreadContactMessages > 1 ? "s" : ""} waiting for review.` });
    }
    if (expiringIn7Days > 0) {
      alerts.push({ id: "exp-7", type: "warning", message: `${expiringIn7Days} memberships expiring within 7 days.` });
    }
    if (pendingSalaries > 0) {
      alerts.push({ id: "sal-pending", type: "important", message: `${pendingSalaries} staff salaries are currently pending.` });
    }
    if (pendingRent > 0) {
      alerts.push({ id: "rent-due", type: "important", message: `Gym rent for current period is pending!` });
    }
    if (pendingElectricity > 0) {
      alerts.push({ id: "elec-due", type: "warning", message: `Electricity bill payment is pending.` });
    }
    if (pendingMembershipPayments > 0) {
      alerts.push({ id: "mem-bal", type: "info", message: `${pendingMembershipPayments} members have remaining payment balance.` });
    }

    const payload = {
      kpis: {
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        expiringIn7Days,
        expiringIn15Days,
        expiringIn30Days,
        totalStaff,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        yearRevenue,
        monthlyExpenses,
        monthlyProfit,
        pendingMembershipPayments,
        pendingSalaries,
        pendingIncentives,
        pendingRent,
        pendingElectricity,
      },
      monthlyTrends,
      alerts,
    };

    // Save to cache
    statsCache = {
      data: payload,
      timestamp: Date.now(),
    };

    return apiResponse(payload);
  } catch (error) {
    console.error("[OWNER_STATS_GET]", error);
    return apiError("Internal server error", 500);
  }
}
