import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiResponse, NON_ADMIN_MEMBER_FILTER } from "@/lib/auth";

export const runtime = "nodejs";

// In-memory cache with 15s TTL
interface CacheEntry {
  data: unknown;
  timestamp: number;
}
let adminStatsCache: CacheEntry | null = null;
const CACHE_TTL_MS = 15000;

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();

    if (adminStatsCache && now.getTime() - adminStatsCache.timestamp < CACHE_TTL_MS) {
      return apiResponse(adminStatsCache.data);
    }

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Execute 6 light count queries concurrently
    const [
      totalMembers,
      activeMembers,
      todayCheckIns,
      pendingEnquiries,
      unreadContactMessages,
      openComplaints,
    ] = await Promise.all([
      prisma.user.count({ where: NON_ADMIN_MEMBER_FILTER }),
      prisma.user.count({ where: { ...NON_ADMIN_MEMBER_FILTER, isActive: true } }),
      prisma.attendance.count({ where: { date: todayStr, status: "Present" } }),
      prisma.enquiry.count({ where: { status: "Pending" } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.complaint.count({ where: { status: "Open" } }),
    ]);

    const payload = {
      totalMembers,
      activeMembers,
      todayCheckIns,
      pendingEnquiries: pendingEnquiries + unreadContactMessages,
      pendingWalkins: pendingEnquiries,
      unreadContactMessages,
      openComplaints,
    };

    adminStatsCache = {
      data: payload,
      timestamp: Date.now(),
    };

    return apiResponse(payload);
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return apiError("Internal server error", 500);
  }
}
