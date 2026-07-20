import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    const userId = parseInt(session.sub);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user session.' }, { status: 401 });
    }

    // Fetch all diet plans for the user
    const dietPlans = await prisma.dietPlan.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse the meals from JSON string to object
    const formattedPlans = dietPlans.map((plan) => {
      let parsedMeals = [];
      try {
        parsedMeals = JSON.parse(plan.meals);
      } catch (e) {
        console.error('Failed to parse meals JSON', e);
      }
      return {
        id: plan.id,
        goal: plan.goal,
        preference: plan.preference,
        calories: plan.calories,
        protein: plan.protein,
        carbs: plan.carbs,
        fat: plan.fat,
        meals: parsedMeals,
        height: plan.height,
        weight: plan.weight,
        age: plan.age,
        activityLevel: plan.activityLevel,
        allergies: plan.allergies,
        createdAt: plan.createdAt,
      };
    });

    return NextResponse.json(formattedPlans);
  } catch (error: unknown) {
    console.error('Diet History API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch diet history.' },
      { status: 500 }
    );
  }
}
