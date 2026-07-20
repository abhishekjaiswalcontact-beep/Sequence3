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
    const now = new Date();

    // Fetch all memberships
    let memberships = await prisma.membership.findMany({
      where: { userId },
      orderBy: [
        { startDate: "desc" },
        { createdAt: "desc" }
      ]
    });

    // Auto-update expired statuses in the history list if they are still stored as Active/Upcoming
    let updatedAny = false;
    for (const membership of memberships) {
      if ((membership.status === "Active" || membership.status === "Upcoming") && now > new Date(membership.endDate)) {
        await prisma.membership.update({
          where: { id: membership.id },
          data: { status: "Expired" }
        });
        updatedAny = true;
      }
    }

    // Re-fetch if we updated anything to keep the response fresh
    if (updatedAny) {
      memberships = await prisma.membership.findMany({
        where: { userId },
        orderBy: [
          { startDate: "desc" },
          { createdAt: "desc" }
        ]
      });
    }

    return apiResponse(memberships);
  } catch (error) {
    console.error("[GET_MEMBERSHIP_HISTORY_API]", error);
    return apiError("Internal server error", 500);
  }
}
