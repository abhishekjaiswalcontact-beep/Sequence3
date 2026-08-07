import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getISTDateTime } from '@/lib/date';

export const runtime = "nodejs";

export async function GET(req: Request) {
  return handleAbsentCalculation(req);
}

export async function POST(req: Request) {
  return handleAbsentCalculation(req);
}

async function handleAbsentCalculation(req: Request) {
  try {
    // Validate Cron Authorization Token
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
    }

    const { dateStr: todayStr } = getISTDateTime();
    const todayDate = new Date();

    // Fetch all active members who have active memberships today
    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        memberships: {
          some: {
            status: "Active",
            startDate: { lte: todayDate },
            endDate: { gte: todayDate },
          }
        }
      },
      select: {
        id: true,
        name: true,
      }
    });

    let markedAbsentCount = 0;
    let alreadyMarkedCount = 0;

    // Process each member
    for (const user of activeUsers) {
      // Check if they already have an attendance record for today
      const existing = await prisma.attendance.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: todayStr,
          }
        }
      });

      if (!existing) {
        // Automatically mark as Absent
        await prisma.$transaction([
          prisma.attendance.create({
            data: {
              userId: user.id,
              date: todayStr,
              time: '23:59:59',
              status: 'Absent',
            }
          }),
          prisma.attendanceLog.create({
            data: {
              userId: user.id,
              action: 'Marked Absent (Auto)',
              details: `Automatically marked absent for date ${todayStr} by system scheduler`,
            }
          })
        ]);
        markedAbsentCount++;
      } else {
        alreadyMarkedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      date: todayStr,
      activeMembersChecked: activeUsers.length,
      markedAbsent: markedAbsentCount,
      alreadyMarked: alreadyMarkedCount,
    });
  } catch (error) {
    console.error("[CRON_ABSENT_CALCULATION_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
