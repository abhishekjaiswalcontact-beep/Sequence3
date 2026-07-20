import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const userId = parseInt(session.sub);

    const progressLogs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(progressLogs);
  } catch (error: unknown) {
    console.error('Progress GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress history.' }, { status: 500 });
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
    const {
      weight,
      bmi,
      bodyFat,
      waist,
      chest,
      arms,
      thighs,
      date = new Date().toISOString().split('T')[0],
    } = body;

    if (weight === undefined || typeof weight !== 'number') {
      return NextResponse.json({ error: 'Weight is required.' }, { status: 400 });
    }

    // Check if user has profile to update weight there as well
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    let calculatedBmi = bmi;
    if (!calculatedBmi && profile?.height) {
      calculatedBmi = Number((weight / ((profile.height / 100) * (profile.height / 100))).toFixed(1));
    }

    // Upsert weight log for the specified date
    const existingLog = await prisma.weightLog.findFirst({
      where: { userId, date },
    });

    let savedLog;
    if (existingLog) {
      savedLog = await prisma.weightLog.update({
        where: { id: existingLog.id },
        data: {
          weight,
          bmi: calculatedBmi || null,
          bodyFat: bodyFat !== undefined ? bodyFat : null,
          waist: waist !== undefined ? waist : null,
          chest: chest !== undefined ? chest : null,
          arms: arms !== undefined ? arms : null,
          thighs: thighs !== undefined ? thighs : null,
        },
      });
    } else {
      savedLog = await prisma.weightLog.create({
        data: {
          userId,
          weight,
          bmi: calculatedBmi || null,
          bodyFat: bodyFat !== undefined ? bodyFat : null,
          waist: waist !== undefined ? waist : null,
          chest: chest !== undefined ? chest : null,
          arms: arms !== undefined ? arms : null,
          thighs: thighs !== undefined ? thighs : null,
          date,
        },
      });
    }

    // Update currentWeight in Profile if logged for today/latest date
    if (profile) {
      const latestLog = await prisma.weightLog.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      });
      if (latestLog && latestLog.date === date) {
        await prisma.userProfile.update({
          where: { userId },
          data: {
            currentWeight: weight,
            bmi: latestLog.bmi || profile.bmi,
            bodyFat: latestLog.bodyFat || profile.bodyFat,
          },
        });
      }
    }

    return NextResponse.json({ success: true, log: savedLog });
  } catch (error: unknown) {
    console.error('Progress POST Error:', error);
    return NextResponse.json({ error: 'Failed to save progress log.' }, { status: 500 });
  }
}
