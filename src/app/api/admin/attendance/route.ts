import { prisma } from '@/lib/prisma';
import { requireAdmin, apiError, apiResponse } from '@/lib/auth';
import { getISTDateTime } from '@/lib/date';
import { Prisma } from '@prisma/client';

export const runtime = "nodejs";

// GET - List users with membership info and attendance records
export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || '';
    const dateVal = searchParams.get('date') || ''; // YYYY-MM-DD
    const monthVal = searchParams.get('month') || ''; // YYYY-MM

    const { dateStr: todayStr } = getISTDateTime();
    const targetDate = dateVal || todayStr;

    // Build query conditions
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (plan) {
      where.memberships = {
        some: { plan }
      };
    }

    // Query users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        memberships: {
          select: {
            membershipId: true,
            plan: true,
            status: true,
            startDate: true,
            endDate: true,
          },
          orderBy: { startDate: 'desc' },
          take: 1, // Get the latest membership plan
        },
        attendances: {
          where: monthVal 
            ? { date: { startsWith: monthVal } } 
            : { date: targetDate },
          select: {
            id: true,
            date: true,
            time: true,
            status: true,
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Formatting response to attach current/selected date status directly
    const formattedUsers = users.map(user => {
      const latestMembership = user.memberships[0] || null;
      
      // If month filter is active, return all records for the month.
      // Otherwise, return single record for targetDate.
      const targetRecord = monthVal 
        ? user.attendances 
        : user.attendances.find(a => a.date === targetDate) || null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        membership: latestMembership,
        attendance: targetRecord, // Can be array (for month filter) or object/null (for date filter)
      };
    });

    return apiResponse({
      targetDate,
      monthVal: monthVal || null,
      users: formattedUsers
    });
  } catch (error) {
    console.error("[ADMIN_ATTENDANCE_GET]", error);
    return apiError("Internal server error while fetching members attendance", 500);
  }
}

// POST - Manually mark attendance (Present / Absent) by admin
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { userId, date, status, time } = body;

    if (!userId || !date || !status) {
      return apiError("Missing required parameters: userId, date, status", 400);
    }

    if (status !== 'Present' && status !== 'Absent') {
      return apiError("Invalid status. Must be 'Present' or 'Absent'", 400);
    }

    const { timeStr: currentISTTime } = getISTDateTime();
    const targetTime = time || (status === 'Present' ? currentISTTime : '00:00:00');

    // Perform upsert inside database transaction with logging
    const attendance = await prisma.$transaction(async (tx) => {
      const record = await tx.attendance.upsert({
        where: {
          userId_date: {
            userId: Number(userId),
            date: String(date),
          }
        },
        update: {
          status,
          time: targetTime,
        },
        create: {
          userId: Number(userId),
          date: String(date),
          time: targetTime,
          status,
        }
      });

      await tx.attendanceLog.create({
        data: {
          userId: Number(userId),
          action: `Marked ${status} (Admin)`,
          details: `Manually marked ${status} for date ${date} at ${targetTime} IST by Admin`,
        }
      });

      return record;
    });

    return apiResponse({
      message: `Successfully marked attendance as ${status}`,
      attendance
    });
  } catch (error) {
    console.error("[ADMIN_ATTENDANCE_POST]", error);
    return apiError("Internal server error while manual attendance logging", 500);
  }
}

// DELETE - Revert/delete wrong attendance entries
export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const userIdVal = searchParams.get('userId');
    const dateVal = searchParams.get('date');
    const attendanceIdVal = searchParams.get('id');

    if (!attendanceIdVal && (!userIdVal || !dateVal)) {
      return apiError("Specify 'id' or both 'userId' and 'date' to delete attendance", 400);
    }

    const attendance = await prisma.$transaction(async (tx) => {
      let record = null;
      if (attendanceIdVal) {
        record = await tx.attendance.delete({
          where: { id: parseInt(attendanceIdVal, 10) }
        });
      } else {
        record = await tx.attendance.delete({
          where: {
            userId_date: {
              userId: parseInt(userIdVal!, 10),
              date: String(dateVal)
            }
          }
        });
      }

      await tx.attendanceLog.create({
        data: {
          userId: record.userId,
          action: 'Deleted (Admin)',
          details: `Deleted attendance entry for date ${record.date} (was ${record.status})`,
        }
      });

      return record;
    });

    return apiResponse({
      message: "Attendance entry deleted successfully",
      revertedRecord: attendance
    });
  } catch (error) {
    console.error("[ADMIN_ATTENDANCE_DELETE]", error);
    return apiError("Internal server error or record not found", 500);
  }
}
