import { prisma } from '@/lib/prisma';
import { requireAdmin, apiError, apiResponse } from '@/lib/auth';
import { getISTDateTime } from '@/app/api/attendance/mark/route';

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();

    const { dateStr: todayStr } = getISTDateTime();
    const today = new Date(todayStr);

    // Fetch all attendance records
    const records = await prisma.attendance.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    const totalPresent = records.filter(r => r.status === 'Present').length;
    const totalAbsent = records.filter(r => r.status === 'Absent').length;
    const totalRecords = totalPresent + totalAbsent;
    const overallPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 100;

    // 1. Calculate Trend Graph Data (Last 14 days)
    const trends: Record<string, { present: number; absent: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = new Intl.DateTimeFormat('fr-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);
      
      trends[dStr] = { present: 0, absent: 0 };
    }

    records.forEach(r => {
      if (trends[r.date]) {
        if (r.status === 'Present') trends[r.date].present += 1;
        else trends[r.date].absent += 1;
      }
    });

    const trendsList = Object.entries(trends).map(([date, counts]) => ({
      date,
      present: counts.present,
      absent: counts.absent,
    }));

    // 2. Member Statistics: group by user
    const memberStats: Record<number, { 
      user: { id: number; name: string; email: string; phone: string };
      present: number;
      absent: number;
      dates: string[];
    }> = {};

    records.forEach(r => {
      const u = r.user;
      if (!memberStats[u.id]) {
        memberStats[u.id] = {
          user: { id: u.id, name: u.name, email: u.email, phone: u.phone },
          present: 0,
          absent: 0,
          dates: [],
        };
      }
      if (r.status === 'Present') {
        memberStats[u.id].present += 1;
        memberStats[u.id].dates.push(r.date);
      } else {
        memberStats[u.id].absent += 1;
      }
    });

    const membersList = Object.values(memberStats).map(m => {
      const total = m.present + m.absent;
      const percentage = total > 0 ? Math.round((m.present / total) * 100) : 100;

      // Calculate streak
      const sortedDates = m.dates.sort();
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;

      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
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

      if (sortedDates.length > 0) {
        const lastPresentDateStr = sortedDates[sortedDates.length - 1];
        const lastPresent = new Date(lastPresentDateStr);
        const diffTime = Math.abs(today.getTime() - lastPresent.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          currentStreak = tempStreak;
        }
      }

      return {
        user: m.user,
        present: m.present,
        absent: m.absent,
        percentage,
        currentStreak,
        longestStreak,
      };
    });

    // Rank Most Consistent (descending present count, secondary sorting on longest streak)
    const mostConsistent = [...membersList]
      .filter(m => m.present > 0)
      .sort((a, b) => b.present - a.present || b.longestStreak - a.longestStreak)
      .slice(0, 5);

    // Rank Least Active (highest absences or lowest percentage)
    const leastActive = [...membersList]
      .filter(m => m.absent > 0)
      .sort((a, b) => b.absent - a.absent || a.percentage - b.percentage)
      .slice(0, 5);

    return apiResponse({
      overall: {
        totalPresent,
        totalAbsent,
        overallPercentage,
        activeMembersCount: membersList.length,
      },
      trends: trendsList,
      mostConsistent,
      leastActive,
    });
  } catch (error) {
    console.error("[ADMIN_ATTENDANCE_ANALYTICS_GET]", error);
    return apiError("Internal server error while fetching analytics", 500);
  }
}
