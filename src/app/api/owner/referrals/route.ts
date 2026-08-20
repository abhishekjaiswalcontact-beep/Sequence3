import { prisma } from "@/lib/prisma";
import { requireOwner, apiError, apiResponse } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";

const OwnerReferralActionSchema = z.object({
  action: z.enum(["toggle-system", "save-rewards-settings", "update-referral-status", "delete-referral"]),
  systemEnabled: z.boolean().optional(),
  rewardsConfig: z.string().optional(),
  referralId: z.number().optional(),
  status: z.string().optional(),
  rewardStatus: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    await requireOwner();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const whereConditions: Record<string, unknown>[] = [];
    if (status) whereConditions.push({ status });

    if (search) {
      whereConditions.push({
        OR: [
          { codeUsed: { contains: search, mode: "insensitive" } },
          { referrer: { name: { contains: search, mode: "insensitive" } } },
          { referrer: { email: { contains: search, mode: "insensitive" } } },
          { referred: { name: { contains: search, mode: "insensitive" } } },
          { referred: { email: { contains: search, mode: "insensitive" } } },
        ]
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const referrals = await prisma.referral.findMany({
      where,
      include: {
        referrer: { select: { id: true, name: true, email: true, phone: true } },
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            memberships: { orderBy: { createdAt: "desc" }, take: 1 }
          }
        }
      },
      orderBy: { joinDate: "desc" }
    });

    const totalReferrals = referrals.length;
    const successfulReferrals = referrals.filter(r => ["Joined", "Membership Activated", "Completed"].includes(r.status)).length;
    const pendingReferrals = referrals.filter(r => r.status === "Pending").length;

    // Settings
    const systemSetting = await prisma.systemSetting.findUnique({ where: { key: "REFERRAL_SYSTEM_ENABLED" } });
    const systemEnabled = systemSetting ? systemSetting.value === "true" : true;

    const rewardsSetting = await prisma.systemSetting.findUnique({ where: { key: "REFERRAL_REWARDS_CONFIG" } });
    const defaultRewards = JSON.stringify([
      { referrals: 5, rewardName: "5 Invites Reward", rewardType: "Free Membership Days", rewardValue: "7 Days", enabled: true },
      { referrals: 10, rewardName: "10 Invites Cash Bonus", rewardType: "Cash Reward", rewardValue: "500 Cash", enabled: true },
      { referrals: 20, rewardName: "VIP Member Badge & Kit", rewardType: "Gift", rewardValue: "Gym Kit Bag", enabled: true },
    ]);
    const rewardsConfig = rewardsSetting ? JSON.parse(rewardsSetting.value) : JSON.parse(defaultRewards);

    return apiResponse({
      referrals,
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      systemEnabled,
      rewardsConfig,
    });
  } catch (error) {
    console.error("[OWNER_REFERRALS_GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();
    const parse = OwnerReferralActionSchema.safeParse(body);

    if (!parse.success) return apiError("Invalid parameters", 400);

    const { action, systemEnabled, rewardsConfig, referralId, status, rewardStatus, notes } = parse.data;

    if (action === "toggle-system") {
      if (systemEnabled === undefined) return apiError("Missing systemEnabled parameter", 400);

      await prisma.systemSetting.upsert({
        where: { key: "REFERRAL_SYSTEM_ENABLED" },
        update: { value: systemEnabled ? "true" : "false" },
        create: { key: "REFERRAL_SYSTEM_ENABLED", value: systemEnabled ? "true" : "false" }
      });

      await prisma.auditLog.create({
        data: {
          action: "REFERRAL_TOGGLED",
          performedByUserId: Number(session.sub),
          performedByName: session.name || session.email,
          role: "OWNER",
          description: `Owner ${systemEnabled ? "ENABLED" : "DISABLED"} the global referral system.`,
        }
      }).catch(() => {});

      return apiResponse({ message: `Referral system is now ${systemEnabled ? "enabled" : "disabled"}.` });
    }

    if (action === "save-rewards-settings") {
      if (!rewardsConfig) return apiError("Missing rewardsConfig parameter", 400);

      await prisma.systemSetting.upsert({
        where: { key: "REFERRAL_REWARDS_CONFIG" },
        update: { value: rewardsConfig },
        create: { key: "REFERRAL_REWARDS_CONFIG", value: rewardsConfig }
      });

      await prisma.auditLog.create({
        data: {
          action: "SETTINGS_CHANGED",
          performedByUserId: Number(session.sub),
          performedByName: session.name || session.email,
          role: "OWNER",
          description: `Owner updated global referral milestone configurations.`,
        }
      }).catch(() => {});

      return apiResponse({ message: "Referral milestone settings updated." });
    }

    if (action === "update-referral-status") {
      if (!referralId) return apiError("Missing referralId", 400);

      const updated = await prisma.referral.update({
        where: { id: referralId },
        data: {
          ...(status ? { status } : {}),
          ...(rewardStatus ? { rewardStatus } : {}),
          ...(notes !== undefined ? { notes } : {}),
        }
      });

      return apiResponse({ message: "Referral updated successfully.", referral: updated });
    }

    if (action === "delete-referral") {
      if (!referralId) return apiError("Missing referralId", 400);

      await prisma.referral.delete({ where: { id: referralId } });
      return apiResponse({ message: "Referral record deleted." });
    }

    return apiError("Action not recognized", 400);
  } catch (error) {
    console.error("[OWNER_REFERRALS_POST]", error);
    return apiError("Internal server error", 500);
  }
}
