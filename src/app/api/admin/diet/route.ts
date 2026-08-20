import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, apiError, apiResponse, NON_OWNER_USER_FILTER, isOwnerUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Authenticate admin
    await requirePermission("MANAGE_DIET_PLANS");

    const { searchParams } = new URL(req.url);
    const userIdStr = searchParams.get('userId');

    if (!userIdStr) {
      // List all users with active diet plan status
      const users = await prisma.user.findMany({
        where: NON_OWNER_USER_FILTER,
        select: {
          id: true,
          name: true,
          email: true,
          dietPlans: {
            select: {
              id: true,
              isLocked: true,
              isManual: true,
              calories: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      });

      return apiResponse(users);
    }

    const userId = parseInt(userIdStr);
    if (isNaN(userId)) {
      return apiError('Invalid User ID', 400);
    }

    // Fetch details for a specific user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isOwner: true, role: true },
    });

    if (!user || isOwnerUser(user)) {
      return apiError('User not found or access denied', 404);
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const activeDiet = await prisma.dietPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const dietHistory = await prisma.dietPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    const weightLogs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    const waterLogs = await prisma.waterLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const mealLogs = await prisma.mealLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const chatLogs = await prisma.dietChatLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return apiResponse({
      user: { id: user.id, name: user.name, email: user.email },
      profile,
      activeDiet: activeDiet ? {
        ...activeDiet,
        meals: JSON.parse(activePlanMeals(activeDiet.meals)),
        groceryList: activeDiet.groceryList ? JSON.parse(activeDiet.groceryList) : null,
        supplementRecommendations: activeDiet.supplementRecommendations ? JSON.parse(activeDiet.supplementRecommendations) : null,
        micronutrients: activeDiet.micronutrients ? JSON.parse(activeDiet.micronutrients) : null,
      } : null,
      dietHistory: dietHistory.map(plan => ({
        ...plan,
        meals: JSON.parse(activePlanMeals(plan.meals)),
      })),
      weightLogs,
      waterLogs,
      mealLogs,
      chatLogs,
    });
  } catch (error) {
    console.error('[ADMIN_DIET_GET]', error);
    return apiError('Unauthorized', 403);
  }
}

function activePlanMeals(mealsStr: string): string {
  try {
    return mealsStr;
  } catch {
    return '[]';
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("MANAGE_DIET_PLANS");

    const body = await req.json();
    const {
      userId,
      goal = 'manual',
      preference = 'veg',
      calories,
      protein,
      carbs,
      fat,
      meals,
      trainerNotes,
      isLocked = false,
    } = body;

    if (!userId || !calories || !protein || !carbs || !fat || !meals) {
      return apiError('Missing required fields for manual diet plan.', 400);
    }

    const targetUserId = parseInt(userId);

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser || isOwnerUser(targetUser)) {
      return apiError('Permission denied: Cannot manage diet for Owner account.', 403);
    }

    // Create the manual plan
    const newPlan = await prisma.dietPlan.create({
      data: {
        userId: targetUserId,
        goal,
        preference,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        meals: typeof meals === 'string' ? meals : JSON.stringify(meals),
        isManual: true,
        isLocked,
        trainerNotes,
      },
    });

    return apiResponse({
      success: true,
      message: 'Manual diet plan created.',
      plan: newPlan,
    });
  } catch (error) {
    console.error('[ADMIN_DIET_POST]', error);
    return apiError('Failed to create manual plan.', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("MANAGE_DIET_PLANS");

    const body = await req.json();
    const {
      dietPlanId,
      trainerNotes,
      isLocked,
      meals,
      calories,
      protein,
      carbs,
      fat,
    } = body;

    if (!dietPlanId) {
      return apiError('Diet Plan ID is required.', 400);
    }

    const planId = parseInt(dietPlanId);

    const existingPlan = await prisma.dietPlan.findUnique({
      where: { id: planId },
      include: { user: true },
    });

    if (!existingPlan || isOwnerUser(existingPlan.user)) {
      return apiError('Diet plan not found or access denied.', 404);
    }

    const updateData: Record<string, string | number | boolean> = {};
    if (trainerNotes !== undefined) updateData.trainerNotes = trainerNotes;
    if (isLocked !== undefined) updateData.isLocked = isLocked;
    if (meals !== undefined) updateData.meals = typeof meals === 'string' ? meals : JSON.stringify(meals);
    if (calories !== undefined) updateData.calories = parseInt(calories);
    if (protein !== undefined) updateData.protein = parseFloat(protein);
    if (carbs !== undefined) updateData.carbs = parseFloat(carbs);
    if (fat !== undefined) updateData.fat = parseFloat(fat);

    const updated = await prisma.dietPlan.update({
      where: { id: planId },
      data: updateData,
    });

    return apiResponse({
      success: true,
      message: 'Diet plan updated.',
      plan: updated,
    });
  } catch (error) {
    console.error('[ADMIN_DIET_PATCH]', error);
    return apiError('Failed to update plan.', 500);
  }
}

