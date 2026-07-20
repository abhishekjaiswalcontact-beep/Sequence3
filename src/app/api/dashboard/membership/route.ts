import { prisma } from "@/lib/prisma";
import { getSession, apiResponse, apiError } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Unauthorized", 401);
    }

    const userId = Number(session.sub);

    // Get all user memberships to determine the current active/relevant one
    const memberships = await prisma.membership.findMany({
      where: { userId },
      orderBy: [
        { startDate: "desc" },
        { createdAt: "desc" }
      ]
    });

    if (memberships.length === 0) {
      return apiResponse({ membership: null });
    }

    // Find active membership, or upcoming, or most recent
    let current = memberships.find(m => m.status === "Active");
    if (!current) {
      current = memberships.find(m => m.status === "Upcoming");
    }
    if (!current) {
      current = memberships.find(m => m.status === "Frozen");
    }
    if (!current) {
      current = memberships[0]; // Take the most recent one (could be Expired or Cancelled)
    }

    const now = new Date();

    // Auto-calculate expiration status: if Active or Upcoming, but endDate has passed, set status to Expired
    if ((current.status === "Active" || current.status === "Upcoming") && now > new Date(current.endDate)) {
      current = await prisma.membership.update({
        where: { id: current.id },
        data: { status: "Expired" }
      });
    }

    // Dynamic calculations
    const start = new Date(current.startDate);
    const end = new Date(current.endDate);
    
    // Set hours for accurate day count comparisons
    const startCopy = new Date(start);
    startCopy.setHours(0,0,0,0);
    const endCopy = new Date(end);
    endCopy.setHours(23,59,59,999);
    const nowCopy = new Date(now);
    
    const totalDurationMs = endCopy.getTime() - startCopy.getTime();
    const totalDays = Math.max(1, Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24)));
    
    const remainingMs = endCopy.getTime() - nowCopy.getTime();
    const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    
    const percentRemaining = Math.min(100, Math.max(0, (daysRemaining / totalDays) * 100));

    return apiResponse({
      membership: current,
      daysRemaining,
      totalDays,
      percentRemaining,
      isExpired: current.status === "Expired" || now > end,
      isExpiringSoon: (current.status === "Active" || current.status === "Upcoming") && daysRemaining <= 7 && daysRemaining > 0
    });
  } catch (error) {
    console.error("[GET_USER_MEMBERSHIP_API]", error);
    return apiError("Internal server error", 500);
  }
}
