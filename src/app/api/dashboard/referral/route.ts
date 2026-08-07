import { prisma } from '@/lib/prisma';
import { getSession, apiError, apiResponse } from '@/lib/auth';
import { generateReferralCode } from '@/lib/referral';

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const userId = parseInt(session.sub, 10);

    // 1. Fetch or generate user's referral code
    let referralCodeRecord = await prisma.referralCode.findUnique({
      where: { userId }
    });

    if (!referralCodeRecord) {
      const code = await generateReferralCode();
      referralCodeRecord = await prisma.referralCode.create({
        data: {
          code,
          userId
        }
      });
    }

    // 2. Fetch stats
    const totalReferrals = await prisma.referral.count({
      where: { referrerId: userId }
    });

    const successfulReferrals = await prisma.referral.count({
      where: {
        referrerId: userId,
        status: { in: ['Joined', 'Membership Activated', 'Completed'] }
      }
    });

    const pendingReferrals = await prisma.referral.count({
      where: {
        referrerId: userId,
        status: 'Pending'
      }
    });

    // 3. Fetch history of referred members
    const referralHistory = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            name: true,
            createdAt: true,
            memberships: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                plan: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: { joinDate: 'desc' }
    });

    // 4. Fetch earned rewards
    const rewards = await prisma.referralReward.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // 5. Fetch activities
    const activities = await prisma.referralActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // 6. Load current rewards configurations to compute milestones progression
    const rewardsConfigSetting = await prisma.systemSetting.findUnique({
      where: { key: 'REFERRAL_REWARDS_CONFIG' }
    });
    const defaultRewardsConfig = [
      { referrals: 5, rewardName: 'Reward A', rewardType: 'Free Membership Days', rewardValue: '7 Days', enabled: true },
      { referrals: 10, rewardName: 'Reward B', rewardType: 'Cash Reward', rewardValue: '500 Cash', enabled: true },
      { referrals: 20, rewardName: 'Reward C', rewardType: 'Discount', rewardValue: '15% Off', enabled: true },
      { referrals: 50, rewardName: 'Reward D', rewardType: 'Gift', rewardValue: 'Gym Kit Bag', enabled: true }
    ];
    const config = rewardsConfigSetting ? JSON.parse(rewardsConfigSetting.value) : defaultRewardsConfig;

    // Check system status
    const systemEnabledSetting = await prisma.systemSetting.findUnique({
      where: { key: 'REFERRAL_SYSTEM_ENABLED' }
    });
    const systemEnabled = systemEnabledSetting ? systemEnabledSetting.value === 'true' : true;

    return apiResponse({
      referralCode: referralCodeRecord.code,
      referralCodeActive: referralCodeRecord.isActive,
      stats: {
        totalReferrals,
        successfulReferrals,
        pendingReferrals
      },
      history: referralHistory,
      rewards,
      activities,
      milestones: config,
      systemEnabled
    });

  } catch (error) {
    console.error("[MEMBER_REFERRAL_GET]", error);
    return apiError("Internal server error", 500);
  }
}
