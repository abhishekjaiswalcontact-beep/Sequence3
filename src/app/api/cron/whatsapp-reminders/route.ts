import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getISTDateTime } from '@/lib/date';
import { sendWhatsAppReminder } from '@/lib/whatsapp';

export const runtime = "nodejs";

export async function GET(req: Request) {
  return handleWhatsAppReminders(req);
}

export async function POST(req: Request) {
  return handleWhatsAppReminders(req);
}

async function handleWhatsAppReminders(req: Request) {
  try {
    // Validate Cron Authorization Token
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
    }

    // Check system settings to see if WhatsApp reminders are enabled
    const reminderSetting = await prisma.systemSetting.findUnique({
      where: { key: 'whatsapp_reminders_enabled' }
    });

    const isEnabled = reminderSetting ? reminderSetting.value === 'true' : false;

    if (!isEnabled) {
      return NextResponse.json({
        success: true,
        message: "WhatsApp reminders are disabled in admin settings.",
      });
    }

    const { dateStr: todayStr } = getISTDateTime();
    const todayDate = new Date();

    // 1. Find all active members who have an active membership today
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
        phone: true,
        email: true,
      }
    });

    // 2. Filter out users who have already marked attendance today (either Present or Absent)
    const unmarkedUsers = [];
    for (const user of activeUsers) {
      const attendance = await prisma.attendance.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: todayStr,
          }
        }
      });

      if (!attendance) {
        unmarkedUsers.push(user);
      }
    }

    // 3. Determine the website URL base for the attendance link
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || `${protocol}://${host}`;
    const dashboardAttendanceUrl = `${siteUrl.replace(/\/$/, '')}/dashboard/attendance`;

    let sentSuccessCount = 0;
    let sentFailureCount = 0;
    const details = [];

    // 4. Send WhatsApp reminders
    for (const user of unmarkedUsers) {
      if (!user.phone) {
        sentFailureCount++;
        details.push({ userId: user.id, name: user.name, status: 'Failed', error: 'No phone number registered' });
        continue;
      }

      const result = await sendWhatsAppReminder(
        user.id,
        user.phone,
        user.name,
        dashboardAttendanceUrl
      );

      if (result.success) {
        sentSuccessCount++;
        details.push({ userId: user.id, name: user.name, status: 'Sent', provider: result.provider });
      } else {
        sentFailureCount++;
        details.push({ userId: user.id, name: user.name, status: 'Failed', error: result.error });
      }
    }

    return NextResponse.json({
      success: true,
      date: todayStr,
      activeMembersCount: activeUsers.length,
      unmarkedCount: unmarkedUsers.length,
      remindersSent: sentSuccessCount,
      remindersFailed: sentFailureCount,
      details,
    });
  } catch (error) {
    console.error("[CRON_WHATSAPP_REMINDERS_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
