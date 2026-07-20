import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ProfileSchema = z.object({
  age: z.number().int().min(1).max(120),
  gender: z.string(),
  height: z.number().min(30).max(300),
  currentWeight: z.number().min(10).max(500),
  targetWeight: z.number().min(10).max(500),
  bodyFat: z.number().optional().nullable(),
  activityLevel: z.string(),
  workoutFrequency: z.number().int().min(0).max(7).optional().nullable(),
  workoutTiming: z.string().optional().nullable(),
  fitnessGoal: z.string(),
  healthConditions: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  preference: z.string(),
  restrictions: z.string().optional().nullable(),
  excludedFoods: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  wakeUpTime: z.string().optional().nullable(),
  breakfastTime: z.string().optional().nullable(),
  midMorningTime: z.string().optional().nullable(),
  lunchTime: z.string().optional().nullable(),
  eveningSnackTime: z.string().optional().nullable(),
  dinnerTime: z.string().optional().nullable(),
  bedtimeMealTime: z.string().optional().nullable(),
  remindersEnabled: z.string().optional().nullable(),
});

function calculateMetrics(weight: number, height: number, age: number, gender: string, activityLevel: string, fitnessGoal: string) {
  // BMI
  const bmi = Number((weight / ((height / 100) * (height / 100))).toFixed(1));

  // BMR (Mifflin-St Jeor)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  // TDEE Multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };
  const multiplier = activityMultipliers[activityLevel] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  // Goal adjustments
  let targetCalories = tdee;
  if (fitnessGoal === 'weight-loss' || fitnessGoal === 'fat-loss') {
    targetCalories -= 500;
  } else if (fitnessGoal === 'muscle-gain' || fitnessGoal === 'lean-bulk') {
    targetCalories += 300;
  } else if (fitnessGoal === 'body-recomp') {
    targetCalories -= 200;
  }
  if (targetCalories < 1200) targetCalories = 1200;

  // Water Intake: weight * 35 ml + activity factor
  let targetWater = weight * 35;
  if (activityLevel === 'active') {
    targetWater += 1000;
  } else if (activityLevel === 'moderate') {
    targetWater += 500;
  }
  targetWater = Number((targetWater / 1000).toFixed(2)); // in Liters

  return { bmi, bmr, tdee, targetCalories, targetWater };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const userId = parseInt(session.sub);

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    const metrics = calculateMetrics(
      profile.currentWeight,
      profile.height,
      profile.age,
      profile.gender,
      profile.activityLevel,
      profile.fitnessGoal
    );

    return NextResponse.json({
      profile,
      metrics,
    });
  } catch (error: unknown) {
    console.error('Profile GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const userId = parseInt(session.sub);

    const body = await req.json();
    const parsed = ProfileSchema.parse(body);

    const bmi = Number((parsed.currentWeight / ((parsed.height / 100) * (parsed.height / 100))).toFixed(1));

    // Upsert Profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...parsed,
        bmi,
      },
      create: {
        userId,
        ...parsed,
        bmi,
      },
    });

    // Automatically log weight update for today
    const today = new Date().toISOString().split('T')[0];
    await prisma.weightLog.upsert({
      where: {
        id: (await prisma.weightLog.findFirst({ where: { userId, date: today } }))?.id || -1,
      },
      update: {
        weight: parsed.currentWeight,
        bmi,
        bodyFat: parsed.bodyFat,
      },
      create: {
        userId,
        weight: parsed.currentWeight,
        bmi,
        bodyFat: parsed.bodyFat,
        date: today,
      },
    });

    const metrics = calculateMetrics(
      profile.currentWeight,
      profile.height,
      profile.age,
      profile.gender,
      profile.activityLevel,
      profile.fitnessGoal
    );

    return NextResponse.json({
      success: true,
      profile,
      metrics,
    });
  } catch (error: unknown) {
    console.error('Profile POST Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid fields: ' + error.issues.map(e => e.path.join('.') + ': ' + e.message).join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save profile.' }, { status: 500 });
  }
}
