import { prisma } from '@/lib/prisma';
import { requireAdmin, apiError, apiResponse } from '@/lib/auth';
import { generateReferralCode, backfillReferralCodes } from '@/lib/referral';
import { z } from 'zod';

export const runtime = "nodejs";

// Action schema for PATCH/POST
const AdminActionSchema = z.object({
  action: z.enum([
    'regenerate-code',
    'toggle-code-active',
    'delete-referral',
    'update-referral-status',
    'toggle-system',
    'save-rewards-settings'
  ]),
  userId: z.number().optional(),
  codeId: z.number().optional(),
  referralId: z.number().optional(),
  status: z.string().optional(),
  rewardStatus: z.string().optional(),
  notes: z.string().optional(),
  systemEnabled: z.boolean().optional(),
  rewardsConfig: z.string().optional() // JSON string of reward configurations
});

export async function GET(req: Request) {
  try {
    await requireAdmin();

    // Trigger migration backfill to ensure all existing members have a code
    await backfillReferralCodes();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const membership = searchParams.get('membership') || '';
    const dateFilter = searchParams.get('dateFilter') || ''; // 'today' | 'week' | 'month' | 'custom'
    const startDateStr = searchParams.get('startDate') || '';
    const endDateStr = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const exportData = searchParams.get('export') === 'true';

    const offset = (page - 1) * limit;

    // Build Date Filter Conditions
    let dateCondition: Record<string, unknown> | undefined = undefined;
    const now = new Date();
    if (dateFilter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateCondition = { gte: today };
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateCondition = { gte: oneWeekAgo };
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      dateCondition = { gte: oneMonthAgo };
    } else if (dateFilter === 'custom' && startDateStr) {
      const start = new Date(startDateStr);
      const end = endDateStr ? new Date(endDateStr) : new Date();
      end.setHours(23, 59, 59, 999);
      dateCondition = { gte: start, lte: end };
    }

    // Build overall query filters
    const whereConditions: Record<string, unknown>[] = [];

    if (status) {
      whereConditions.push({ status });
    }

    if (dateCondition) {
      whereConditions.push({ joinDate: dateCondition });
    }

    if (membership) {
      whereConditions.push({
        referred: {
          memberships: {
            some: {
              plan: membership
            }
          }
        }
      });
    }

    if (search) {
      const searchNum = parseInt(search, 10);
      whereConditions.push({
        OR: [
          { codeUsed: { contains: search, mode: 'insensitive' } },
          { referrer: { name: { contains: search, mode: 'insensitive' } } },
          { referrer: { email: { contains: search, mode: 'insensitive' } } },
          { referred: { name: { contains: search, mode: 'insensitive' } } },
          { referred: { email: { contains: search, mode: 'insensitive' } } },
          ...(!isNaN(searchNum) ? [
            { referrerId: searchNum },
            { referredId: searchNum }
          ] : [])
        ]
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Fetch Referral Records (with pagination if not exporting)
    const referrals = await prisma.referral.findMany({
      where,
      include: {
        referrer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true
          }
        },
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            memberships: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      },
      orderBy: { joinDate: 'desc' },
      ...(exportData ? {} : { skip: offset, take: limit })
    });

    const totalReferrals = await prisma.referral.count({ where });

    // Fetch Analytics / Dashboard metrics
    const totalCodes = await prisma.referralCode.count();
    const activeCodes = await prisma.referralCode.count({ where: { isActive: true } });
    const successfulReferrals = await prisma.referral.count({
      where: {
        status: { in: ['Joined', 'Membership Activated', 'Completed'] }
      }
    });

    // Date range stats
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayCount = await prisma.referral.count({ where: { joinDate: { gte: startOfToday } } });
    const weekCount = await prisma.referral.count({ where: { joinDate: { gte: startOfWeek } } });
    const monthCount = await prisma.referral.count({ where: { joinDate: { gte: startOfMonth } } });

    // Top Referrers Leaderboard
    const rawTopReferrers = await prisma.referral.groupBy({
      by: ['referrerId'],
      _count: {
        id: true
      },
      where: {
        status: { in: ['Joined', 'Membership Activated', 'Completed'] }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    const topReferrers = await Promise.all(
      rawTopReferrers.map(async (item) => {
        const referrerUser = await prisma.user.findUnique({
          where: { id: item.referrerId },
          select: { name: true, email: true }
        });
        const totalCreated = await prisma.referral.count({
          where: { referrerId: item.referrerId }
        });
        const successfulCount = item._count.id;
        const conversionRate = totalCreated > 0 ? Math.round((successfulCount / totalCreated) * 100) : 0;

        const earnedRewards = await prisma.referralReward.findMany({
          where: { userId: item.referrerId, status: 'Claimed' }
        });

        return {
          referrerId: item.referrerId,
          name: referrerUser?.name || 'Unknown',
          email: referrerUser?.email || '',
          referralCount: totalCreated,
          successfulJoins: successfulCount,
          conversionRate,
          rewardEarned: earnedRewards.map(r => r.rewardName).join(', ') || 'None'
        };
      })
    );

    // Global Settings
    const systemEnabledSetting = await prisma.systemSetting.findUnique({
      where: { key: 'REFERRAL_SYSTEM_ENABLED' }
    });
    const systemEnabled = systemEnabledSetting ? systemEnabledSetting.value === 'true' : true;

    const rewardsConfigSetting = await prisma.systemSetting.findUnique({
      where: { key: 'REFERRAL_REWARDS_CONFIG' }
    });
    const defaultRewardsConfig = JSON.stringify([
      { referrals: 5, rewardName: 'Reward A', rewardType: 'Free Membership Days', rewardValue: '7 Days', enabled: true },
      { referrals: 10, rewardName: 'Reward B', rewardType: 'Cash Reward', rewardValue: '500 Cash', enabled: true },
      { referrals: 20, rewardName: 'Reward C', rewardType: 'Discount', rewardValue: '15% Off', enabled: true },
      { referrals: 50, rewardName: 'Reward D', rewardType: 'Gift', rewardValue: 'Gym Kit Bag', enabled: true }
    ]);
    const rewardsConfig = rewardsConfigSetting ? rewardsConfigSetting.value : defaultRewardsConfig;

    // Activity Logs
    const activities = await prisma.referralActivity.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return apiResponse({
      referrals,
      totalReferrals,
      analytics: {
        totalCodes,
        activeCodes,
        successfulReferrals,
        todayCount,
        weekCount,
        monthCount,
        conversionRate: totalReferrals > 0 ? Math.round((successfulReferrals / totalReferrals) * 100) : 0
      },
      topReferrers,
      systemEnabled,
      rewardsConfig: JSON.parse(rewardsConfig),
      activities
    });

  } catch (error) {
    console.error("[ADMIN_REFERRALS_GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parse = AdminActionSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid parameters: " + parse.error.issues.map(i => i.message).join(", "), 400);
    }

    const {
      action,
      userId,
      codeId,
      referralId,
      status,
      rewardStatus,
      notes,
      systemEnabled,
      rewardsConfig
    } = parse.data;

    // ---------------------------------
    // Action 1: Toggle Referral System Enabled/Disabled
    // ---------------------------------
    if (action === 'toggle-system') {
      if (systemEnabled === undefined) return apiError("Missing systemEnabled parameter", 400);

      await prisma.systemSetting.upsert({
        where: { key: 'REFERRAL_SYSTEM_ENABLED' },
        update: { value: systemEnabled ? 'true' : 'false' },
        create: { key: 'REFERRAL_SYSTEM_ENABLED', value: systemEnabled ? 'true' : 'false' }
      });

      await prisma.referralActivity.create({
        data: {
          activityType: 'SYSTEM_SETTINGS_UPDATED',
          details: `Global referral system is now ${systemEnabled ? 'ENABLED' : 'DISABLED'}`
        }
      });

      return apiResponse({ message: `Referral system is now ${systemEnabled ? 'enabled' : 'disabled'}` });
    }

    // ---------------------------------
    // Action 2: Save Reward Milestones Config
    // ---------------------------------
    if (action === 'save-rewards-settings') {
      if (!rewardsConfig) return apiError("Missing rewardsConfig parameter", 400);

      await prisma.systemSetting.upsert({
        where: { key: 'REFERRAL_REWARDS_CONFIG' },
        update: { value: rewardsConfig },
        create: { key: 'REFERRAL_REWARDS_CONFIG', value: rewardsConfig }
      });

      await prisma.referralActivity.create({
        data: {
          activityType: 'SYSTEM_SETTINGS_UPDATED',
          details: 'Global rewards configurations have been updated.'
        }
      });

      return apiResponse({ message: "Rewards configurations saved successfully." });
    }

    // ---------------------------------
    // Action 3: Regenerate Member Referral Code
    // ---------------------------------
    if (action === 'regenerate-code') {
      if (!userId) return apiError("Missing userId parameter", 400);

      const newCode = await generateReferralCode();

      const updated = await prisma.referralCode.upsert({
        where: { userId },
        update: { code: newCode, isActive: true },
        create: { userId, code: newCode, isActive: true }
      });

      await prisma.referralActivity.create({
        data: {
          userId,
          activityType: 'CODE_GENERATED',
          details: `Admin regenerated code for member to: ${newCode}`
        }
      });

      return apiResponse({ message: "Referral code regenerated successfully.", referralCode: updated });
    }

    // ---------------------------------
    // Action 4: Toggle Referral Code Active Status
    // ---------------------------------
    if (action === 'toggle-code-active') {
      if (!codeId) return apiError("Missing codeId parameter", 400);

      const codeRecord = await prisma.referralCode.findUnique({
        where: { id: codeId }
      });

      if (!codeRecord) return apiError("Referral code not found", 404);

      const updated = await prisma.referralCode.update({
        where: { id: codeId },
        data: { isActive: !codeRecord.isActive }
      });

      await prisma.referralActivity.create({
        data: {
          userId: codeRecord.userId,
          activityType: 'STATUS_UPDATED',
          details: `Admin toggled referral code ${codeRecord.code} to ${updated.isActive ? 'ACTIVE' : 'INACTIVE'}`
        }
      });

      return apiResponse({ message: `Referral code is now ${updated.isActive ? 'active' : 'inactive'}.`, referralCode: updated });
    }

    // ---------------------------------
    // Action 5: Delete Referral Record
    // ---------------------------------
    if (action === 'delete-referral') {
      if (!referralId) return apiError("Missing referralId parameter", 400);

      const referral = await prisma.referral.findUnique({
        where: { id: referralId },
        include: { referred: true }
      });

      if (!referral) return apiError("Referral not found", 404);

      await prisma.referral.delete({
        where: { id: referralId }
      });

      await prisma.referralActivity.create({
        data: {
          activityType: 'REFERRAL_DELETED',
          details: `Admin deleted referral record linking to ${referral.referred.name}`
        }
      });

      return apiResponse({ message: "Referral record deleted successfully." });
    }

    // ---------------------------------
    // Action 6: Update Referral and Reward Status
    // ---------------------------------
    if (action === 'update-referral-status') {
      if (!referralId) return apiError("Missing referralId parameter", 400);

      const referral = await prisma.referral.findUnique({
        where: { id: referralId },
        include: { referred: true, referrer: true }
      });

      if (!referral) return apiError("Referral not found", 404);

      const updateData: Record<string, unknown> = {};
      if (status !== undefined) updateData.status = status;
      if (rewardStatus !== undefined) updateData.rewardStatus = rewardStatus;
      if (notes !== undefined) updateData.notes = notes;

      const updatedReferral = await prisma.referral.update({
        where: { id: referralId },
        data: updateData
      });

      await prisma.referralActivity.create({
        data: {
          userId: referral.referrerId,
          referralId: referral.id,
          activityType: 'STATUS_UPDATED',
          details: `Admin updated referral status of ${referral.referred.name} to ${status || referral.status} and Reward Status to ${rewardStatus || referral.rewardStatus}`
        }
      });

      // Handle rewards progression triggering if status changes to Completed or Membership Activated
      if (status && ['Joined', 'Membership Activated', 'Completed'].includes(status)) {
        // Count total successful referrals of this referrer
        const successfulCount = await prisma.referral.count({
          where: {
            referrerId: referral.referrerId,
            status: { in: ['Joined', 'Membership Activated', 'Completed'] }
          }
        });

        // Load configured reward thresholds
        const rewardsConfigSetting = await prisma.systemSetting.findUnique({
          where: { key: 'REFERRAL_REWARDS_CONFIG' }
        });
        const currentRewards = rewardsConfigSetting ? JSON.parse(rewardsConfigSetting.value) : [];

        // Check if user hit any threshold and if reward is not already granted
        for (const reward of currentRewards) {
          if (reward.enabled && successfulCount >= reward.referrals) {
            const rewardExists = await prisma.referralReward.findFirst({
              where: {
                userId: referral.referrerId,
                rewardName: reward.rewardName
              }
            });

            if (!rewardExists) {
              // Create Reward entry!
              await prisma.referralReward.create({
                data: {
                  userId: referral.referrerId,
                  referralId: referral.id,
                  rewardName: reward.rewardName,
                  rewardType: reward.rewardType,
                  rewardValue: reward.rewardValue,
                  status: 'Pending'
                }
              });

              // Log activity
              await prisma.referralActivity.create({
                data: {
                  userId: referral.referrerId,
                  activityType: 'REWARD_EARNED',
                  details: `User earned ${reward.rewardName} (${reward.rewardValue}) for reaching ${reward.referrals} successful referrals!`
                }
              });

              // Create notification
              await prisma.notification.create({
                data: {
                  userId: referral.referrerId,
                  title: 'New Reward Earned! 🏆',
                  message: `Congratulations! You have earned ${reward.rewardName} (${reward.rewardValue}) for reaching ${reward.referrals} referrals.`
                }
              });
            }
          }
        }
      }

      return apiResponse({ message: "Referral status updated successfully.", referral: updatedReferral });
    }

    return apiError("Action not implemented", 400);

  } catch (error) {
    console.error("[ADMIN_REFERRALS_POST]", error);
    return apiError("Internal server error", 500);
  }
}
