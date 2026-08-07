import { prisma } from '@/lib/prisma';
import { getSession, apiError, apiResponse } from '@/lib/auth';
import { z } from 'zod';

export const runtime = "nodejs";

const UpdateNotificationSchema = z.object({
  notificationId: z.number().optional(),
  markAll: z.boolean().optional()
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const userId = parseInt(session.sub, 10);

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return apiResponse({
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const userId = parseInt(session.sub, 10);
    const body = await req.json();
    const parse = UpdateNotificationSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid parameters", 400);
    }

    const { notificationId, markAll } = parse.data;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
      return apiResponse({ message: "All notifications marked as read." });
    }

    if (notificationId) {
      const notif = await prisma.notification.findUnique({
        where: { id: notificationId }
      });

      if (!notif || notif.userId !== userId) {
        return apiError("Notification not found", 404);
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      return apiResponse({ message: "Notification marked as read." });
    }

    return apiError("Missing parameters", 400);

  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error);
    return apiError("Internal server error", 500);
  }
}
