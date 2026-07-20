import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const userId = parseInt(session.sub);

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const logs = await prisma.mealLog.findMany({
      where: {
        userId,
        date,
      },
    });

    return NextResponse.json(logs);
  } catch (error: unknown) {
    console.error('MealLog GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch meal logs.' }, { status: 500 });
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
    const { dietPlanId, mealName, status, date = new Date().toISOString().split('T')[0] } = body;

    if (!dietPlanId || !mealName || !status) {
      return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 });
    }

    const existingLog = await prisma.mealLog.findFirst({
      where: {
        userId,
        mealName,
        date,
      },
    });

    let savedLog;
    if (existingLog) {
      if (status === 'uncompleted') {
        await prisma.mealLog.delete({
          where: { id: existingLog.id },
        });
        return NextResponse.json({ success: true, deleted: true });
      } else {
        savedLog = await prisma.mealLog.update({
          where: { id: existingLog.id },
          data: { status, dietPlanId },
        });
      }
    } else {
      if (status === 'uncompleted') {
        return NextResponse.json({ success: true, message: 'Already uncompleted.' });
      }
      savedLog = await prisma.mealLog.create({
        data: {
          userId,
          dietPlanId,
          mealName,
          status,
          date,
        },
      });
    }

    return NextResponse.json({ success: true, log: savedLog });
  } catch (error: unknown) {
    console.error('MealLog POST Error:', error);
    return NextResponse.json({ error: 'Failed to log meal.' }, { status: 500 });
  }
}
