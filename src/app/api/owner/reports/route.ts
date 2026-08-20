import { prisma } from "@/lib/prisma";
import { requirePermission, apiError, apiResponse, NON_OWNER_USER_FILTER } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await requirePermission("VIEW_REPORTS");
    const isOwner = !!session.isOwner;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "member"; // member, financial, staff, referral
    const dateRange = searchParams.get("dateRange") || "month"; // day, week, month, year, custom
    const startDateStr = searchParams.get("startDate") || "";
    const endDateStr = searchParams.get("endDate") || "";

    const now = new Date();
    let gteDate = new Date(now.getFullYear(), now.getMonth(), 1);

    if (dateRange === "day") {
      gteDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange === "week") {
      gteDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "year") {
      gteDate = new Date(now.getFullYear(), 0, 1);
    } else if (dateRange === "custom" && startDateStr) {
      gteDate = new Date(startDateStr);
    }

    const lteDate = (dateRange === "custom" && endDateStr) ? new Date(endDateStr) : new Date();
    lteDate.setHours(23, 59, 59, 999);

    if (type === "member") {
      const userWhere = isOwner ? { role: { in: ["MEMBER", ""] } } : { ...NON_OWNER_USER_FILTER, role: { in: ["MEMBER", ""] } };
      const membershipWhere = isOwner ? {} : { user: NON_OWNER_USER_FILTER };

      const totalMembers = await prisma.user.count({ where: userWhere });
      const activeMembers = await prisma.membership.count({ where: { ...membershipWhere, status: "Active" } });
      const expiredMembers = await prisma.membership.count({ where: { ...membershipWhere, status: "Expired" } });
      const newMembers = await prisma.user.count({ where: { ...userWhere, createdAt: { gte: gteDate, lte: lteDate } } });

      const memberList = await prisma.user.findMany({
        where: { ...userWhere, createdAt: { gte: gteDate, lte: lteDate } },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          memberships: { take: 1, orderBy: { startDate: "desc" } }
        }
      });

      return apiResponse({
        reportType: "member",
        summary: { totalMembers, activeMembers, expiredMembers, newMembers },
        data: memberList,
      });
    }

    if (type === "financial") {
      const membershipIncome = await prisma.membership.aggregate({
        where: { createdAt: { gte: gteDate, lte: lteDate } },
        _sum: { amountPaid: true }
      });
      const customIncome = await prisma.gymRevenue.aggregate({
        where: { date: { gte: gteDate, lte: lteDate } },
        _sum: { amount: true }
      });

      const totalRevenue = (membershipIncome._sum.amountPaid || 0) + (customIncome._sum.amount || 0);

      const salaryExp = await prisma.staffSalary.aggregate({
        where: { createdAt: { gte: gteDate, lte: lteDate }, paymentStatus: "Paid" },
        _sum: { totalPayable: true }
      });
      const incentiveExp = await prisma.incentive.aggregate({
        where: { createdAt: { gte: gteDate, lte: lteDate }, paymentStatus: "Paid" },
        _sum: { amount: true }
      });
      const rentExp = await prisma.rentPayment.aggregate({
        where: { createdAt: { gte: gteDate, lte: lteDate }, paymentStatus: "Paid" },
        _sum: { amountPaid: true }
      });
      const elecExp = await prisma.electricityBill.aggregate({
        where: { createdAt: { gte: gteDate, lte: lteDate }, paymentStatus: "Paid" },
        _sum: { billAmount: true }
      });
      const genExp = await prisma.expense.aggregate({
        where: { date: { gte: gteDate, lte: lteDate }, paymentStatus: "Paid" },
        _sum: { amount: true }
      });

      const totalExpenses = (salaryExp._sum.totalPayable || 0) +
        (incentiveExp._sum.amount || 0) +
        (rentExp._sum.amountPaid || 0) +
        (elecExp._sum.billAmount || 0) +
        (genExp._sum.amount || 0);

      return apiResponse({
        reportType: "financial",
        summary: {
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          salaryExpenses: salaryExp._sum.totalPayable || 0,
          incentiveExpenses: incentiveExp._sum.amount || 0,
          rentExpenses: rentExp._sum.amountPaid || 0,
          electricityExpenses: elecExp._sum.billAmount || 0,
          otherExpenses: genExp._sum.amount || 0,
        }
      });
    }

    if (type === "staff") {
      const staffList = await prisma.staff.findMany({
        where: isOwner ? {} : { designation: { notIn: ["Owner", "OWNER"] } },
        include: {
          salaries: { where: { createdAt: { gte: gteDate, lte: lteDate } } },
          incentives: { where: { createdAt: { gte: gteDate, lte: lteDate } } },
          trainerClients: true,
        }
      });

      return apiResponse({
        reportType: "staff",
        summary: { totalStaff: staffList.length },
        data: staffList,
      });
    }

    if (type === "referral") {
      const referralWhere = isOwner
        ? { joinDate: { gte: gteDate, lte: lteDate } }
        : {
            joinDate: { gte: gteDate, lte: lteDate },
            referrer: NON_OWNER_USER_FILTER,
            referred: NON_OWNER_USER_FILTER,
          };

      const referrals = await prisma.referral.findMany({
        where: referralWhere,
        include: {
          referrer: { select: { name: true, email: true } },
          referred: { select: { name: true, email: true } }
        }
      });

      const successfulCount = referrals.filter(r => ["Joined", "Membership Activated", "Completed"].includes(r.status)).length;

      return apiResponse({
        reportType: "referral",
        summary: {
          totalReferrals: referrals.length,
          successfulReferrals: successfulCount,
          pendingReferrals: referrals.length - successfulCount,
        },
        data: referrals,
      });
    }

    return apiError("Unknown report type", 400);
  } catch (error) {
    console.error("[OWNER_REPORTS_GET]", error);
    return apiError("Internal server error", 500);
  }
}

