import { prisma } from "@/lib/prisma";
import { requireOwner, apiError, apiResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireOwner();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || ""; // active, expired, expiring_soon, pending_payment, new
    const planFilter = searchParams.get("plan") || "";

    const now = new Date();
    const date30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const whereConditions: Record<string, unknown>[] = [
      { isOwner: false }
    ];

    if (search) {
      whereConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ]
      });
    }

    if (filter === "active") {
      whereConditions.push({
        memberships: {
          some: { status: "Active" }
        }
      });
    } else if (filter === "expired") {
      whereConditions.push({
        memberships: {
          some: { status: "Expired" }
        }
      });
    } else if (filter === "expiring_soon") {
      whereConditions.push({
        memberships: {
          some: { status: "Active", endDate: { gte: now, lte: date30Days } }
        }
      });
    } else if (filter === "pending_payment") {
      whereConditions.push({
        memberships: {
          some: { remainingBalance: { gt: 0 } }
        }
      });
    } else if (filter === "new") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      whereConditions.push({ createdAt: { gte: thirtyDaysAgo } });
    }

    if (planFilter) {
      whereConditions.push({
        memberships: {
          some: { plan: planFilter }
        }
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const members = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        profile: {
          select: {
            gender: true,
            age: true,
            currentWeight: true,
            targetWeight: true,
            fitnessGoal: true,
          }
        },
        memberships: {
          orderBy: { startDate: "desc" },
        },
        referralReceived: {
          select: {
            codeUsed: true,
            referrer: {
              select: { name: true, email: true }
            }
          }
        },
        assignedAsClient: {
          select: {
            id: true,
            status: true,
            trainer: {
              select: { name: true, phone: true }
            }
          },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Transform members to compute remaining days & normalized details
    const formattedMembers = members.map((m) => {
      const activeMembership = m.memberships[0] || null;
      let remainingDays = 0;
      if (activeMembership && activeMembership.endDate) {
        const diff = new Date(activeMembership.endDate).getTime() - now.getTime();
        remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }

      return {
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        isActive: m.isActive,
        joinDate: m.createdAt,
        lastLoginAt: m.lastLoginAt,
        profile: m.profile,
        activeMembership,
        membershipHistory: m.memberships,
        remainingDays,
        referralSource: m.referralReceived ? `${m.referralReceived.referrer.name} (${m.referralReceived.codeUsed})` : "Direct Signup",
        trainerAssigned: m.assignedAsClient[0]?.trainer?.name || activeMembership?.ptTrainerName || "Not Assigned",
      };
    });

    return apiResponse(formattedMembers);
  } catch (error) {
    console.error("[OWNER_MEMBERS_GET]", error);
    return apiError("Internal server error", 500);
  }
}
