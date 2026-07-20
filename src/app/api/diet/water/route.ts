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

    const logs = await prisma.waterLog.findMany({
      where: {
        userId,
        date,
      },
    });

    const total = logs.reduce((sum, log) => sum + log.amount, 0);

    return NextResponse.json({
      total,
      logs,
    });
  } catch (error: unknown) {
    console.error('Water GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch water logs.' }, { status: 500 });
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
    const { amount, action, date = new Date().toISOString().split('T')[0] } = body;

    if (action === 'reset') {
      await prisma.waterLog.deleteMany({
        where: {
          userId,
          date,
        },
      });
      return NextResponse.json({ success: true, total: 0 });
    }

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid water amount.' }, { status: 400 });
    }

    const log = await prisma.waterLog.create({
      data: {
        userId,
        amount,
        date,
      },
    });

    const allLogs = await prisma.waterLog.findMany({
      where: {
        userId,
        date,
      },
    });
    const total = allLogs.reduce((sum, item) => sum + item.amount, 0);

    return NextResponse.json({
      success: true,
      log,
      total,
    });
  } catch (error: unknown) {
    console.error('Water POST Error:', error);
    return NextResponse.json({ error: 'Failed to log water.' }, { status: 500 });
  }
}
