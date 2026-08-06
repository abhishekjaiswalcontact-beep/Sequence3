import { prisma } from '@/lib/prisma';
import { getSession, apiError, apiResponse } from '@/lib/auth';

export const runtime = "nodejs";

// Helper to get current Date and Time in Asia/Kolkata (IST)
export function getISTDateTime() {
  const now = new Date();
  
  // Format Date: YYYY-MM-DD
  const dateStr = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  // Format Time: HH:MM:SS
  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);

  return { dateStr, timeStr };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Unauthorized: Please log in to mark attendance", 401);
    }

    const userId = parseInt(session.sub, 10);
    if (isNaN(userId)) {
      return apiError("Invalid user session", 400);
    }

    const { dateStr, timeStr } = getISTDateTime();

    // Check if attendance already exists for today to avoid throwing DB error first
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateStr,
        },
      },
    });

    if (existing) {
      return apiError("You have already marked your attendance for today!", 400);
    }

    // Create attendance inside a transaction with the log
    const attendance = await prisma.$transaction(async (tx) => {
      const record = await tx.attendance.create({
        data: {
          userId,
          date: dateStr,
          time: timeStr,
          status: 'Present',
        },
      });

      await tx.attendanceLog.create({
        data: {
          userId,
          action: 'Marked Present (Self)',
          details: `Marked present today at ${timeStr} IST`,
        },
      });

      return record;
    });

    return apiResponse({
      message: "Attendance marked successfully!",
      attendance,
    });
  } catch (error) {
    console.error("[MARK_ATTENDANCE_POST]", error);
    
    // Handle unique constraint code
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return apiError("You have already marked your attendance for today!", 400);
    }

    return apiError("Internal server error while marking attendance", 500);
  }
}
