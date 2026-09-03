import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiResponse, NON_ADMIN_MEMBER_FILTER } from "@/lib/auth";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const runtime = "nodejs";

// In-memory cache with 10s TTL
interface CacheEntry {
  data: unknown;
  timestamp: number;
}
let adminStatsCache: CacheEntry | null = null;
const CACHE_TTL_MS = 10000;

export async function GET() {
  try {
    await requireAdmin();
    await seedWebsiteDataIfEmpty();

    const now = new Date();

    if (adminStatsCache && now.getTime() - adminStatsCache.timestamp < CACHE_TTL_MS) {
      return apiResponse(adminStatsCache.data);
    }

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Execute concurrent count queries
    const [
      totalMembers,
      activeMembers,
      todayCheckIns,
      pendingEnquiries,
      unreadContactMessages,
      openComplaints,
      totalTrainers,
      activeTrainers,
      totalGalleryImages,
      totalPricingPlans,
      totalFAQs,
      totalMediaUploads,
    ] = await Promise.all([
      prisma.user.count({ where: NON_ADMIN_MEMBER_FILTER }),
      prisma.user.count({ where: { ...NON_ADMIN_MEMBER_FILTER, isActive: true } }),
      prisma.attendance.count({ where: { date: todayStr, status: "Present" } }),
      prisma.enquiry.count({ where: { status: "Pending" } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.complaint.count({ where: { status: "Open" } }),
      prisma.websiteTrainer.count(),
      prisma.websiteTrainer.count({ where: { isActive: true } }),
      prisma.websiteGalleryItem.count(),
      prisma.websitePricingPlan.count(),
      prisma.websiteFAQ.count(),
      prisma.mediaUpload.count(),
    ]);

    const payload = {
      totalMembers,
      activeMembers,
      todayCheckIns,
      pendingEnquiries: pendingEnquiries + unreadContactMessages,
      pendingWalkins: pendingEnquiries,
      unreadContactMessages,
      openComplaints,
      totalTrainers,
      activeTrainers,
      totalGalleryImages,
      totalPricingPlans,
      totalFAQs,
      totalMediaUploads,
      websiteStats: {
        trainers: totalTrainers,
        gallery: totalGalleryImages,
        pricing: totalPricingPlans,
        faqs: totalFAQs,
        media: totalMediaUploads,
        messages: unreadContactMessages,
      },
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
