import { prisma } from '@/lib/prisma';
import { getSession, apiError, apiResponse } from '@/lib/auth';
import { getISTDateTime } from '../mark/route';

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Unauthorized: Please log in to view history", 401);
    }

    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');

    let userId = parseInt(session.sub, 10);
    if (session.isAdmin && userIdParam) {
      const parsedParam = parseInt(userIdParam, 10);
      if (!isNaN(parsedParam)) {
        userId = parsedParam;
      }
    }

    if (isNaN(userId)) {
      return apiError("Invalid user session or parameters", 400);
    }

    // Fetch all attendance records for this user, sorted by date ascending
    const records = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    const totalPresent = records.filter(r => r.status === 'Present').length;
    const totalAbsent = records.filter(r => r.status === 'Absent').length;
    const totalDays = totalPresent + totalAbsent;
    const attendancePercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 100;

    // Streak Calculations
    const presentDates = records
      .filter(r => r.status === 'Present')
      .map(r => r.date); // Already sorted ascending by query

    const uniquePresentDates = Array.from(new Set(presentDates));

    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (let i = 0; i < uniquePresentDates.length; i++) {
      const currentDate = new Date(uniquePresentDates[i]);
      if (lastDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
      lastDate = currentDate;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Calculate current active streak
    let currentStreak = 0;
    if (uniquePresentDates.length > 0) {
      const { dateStr: todayStr } = getISTDateTime();
      const lastPresentDateStr = uniquePresentDates[uniquePresentDates.length - 1];

      const today = new Date(todayStr);
      const lastPresent = new Date(lastPresentDateStr);
      const diffTime = Math.abs(today.getTime() - lastPresent.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Streak remains active if user checked in today or yesterday
      if (diffDays <= 1) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
    }

    // Last 30 Days report list
    const last30Days: Array<{ date: string; status: 'Present' | 'Absent' | 'Unmarked' }> = [];
    const { dateStr: todayStr } = getISTDateTime();
    const todayDate = new Date(todayStr);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dStr = new Intl.DateTimeFormat('fr-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);

      const matched = records.find(r => r.date === dStr);
      last30Days.push({
        date: dStr,
        status: matched ? (matched.status as 'Present' | 'Absent') : 'Unmarked',
      });
    }

    // Monthly breakdown data for charts
    const monthlyData: Record<string, { present: number; absent: number }> = {};
    records.forEach(r => {
      // date is YYYY-MM-DD
      const [year, month] = r.date.split('-');
      const monthKey = `${year}-${month}`; // e.g. "2026-08"
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { present: 0, absent: 0 };
      }
      if (r.status === 'Present') {
        monthlyData[monthKey].present += 1;
      } else {
        monthlyData[monthKey].absent += 1;
      }
    });

    const isMarkedToday = records.some(r => r.date === todayStr && r.status === 'Present');

    return apiResponse({
      stats: {
        totalPresent,
        totalAbsent,
        attendancePercentage,
        currentStreak,
        longestStreak,
        isMarkedToday,
      },
      records,
      last30Days,
      monthlyData,
    });
  } catch (error) {
    console.error("[ATTENDANCE_HISTORY_GET]", error);
    return apiError("Internal server error while fetching history", 500);
  }
}
