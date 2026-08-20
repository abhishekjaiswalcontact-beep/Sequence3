import { prisma } from "@/lib/prisma";
import { requireOwner, apiError, apiResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireOwner();

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiResponse(auditLogs);
  } catch (error) {
    console.error("[OWNER_AUDIT_LOGS_GET]", error);
    return apiError("Internal server error", 500);
  }
}
