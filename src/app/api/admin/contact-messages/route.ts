import { requirePermission, apiResponse, apiError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const UpdateContactMessageSchema = z.object({
  id: z.string().optional(),
  ids: z.array(z.string()).optional(),
  markAllRead: z.boolean().optional(),
  isRead: z.boolean().optional(),
  status: z.enum(["Unread", "Read", "Responded", "Archived"]).optional(),
});

export async function GET(req: Request) {
  try {
    await requirePermission("VIEW_ENQUIRIES");

    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get("countOnly") === "true";

    const unreadCount = await prisma.contactMessage.count({
      where: { isRead: false },
    });

    if (countOnly) {
      const totalCount = await prisma.contactMessage.count();
      return apiResponse({ unreadCount, totalCount });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return apiResponse({
      messages,
      unreadCount,
      totalCount: messages.length,
    });
  } catch (error) {
    console.error("[CONTACT_MESSAGES_GET]", error);
    return apiError(error instanceof Error ? error.message : "Unauthorized", 403);
  }
}

export async function PATCH(req: Request) {
  try {
    await requirePermission("VIEW_ENQUIRIES");
    const body = await req.json();
    const parse = UpdateContactMessageSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid contact message update data", 400);
    }

    // Mark all as read action
    if (parse.data.markAllRead) {
      await prisma.contactMessage.updateMany({
        where: { isRead: false },
        data: { isRead: true, status: "Read" },
      });

      const unreadCount = await prisma.contactMessage.count({
        where: { isRead: false },
      });

      return apiResponse({ message: "All messages marked as read", unreadCount });
    }

    // Batch update multiple IDs
    if (parse.data.ids && parse.data.ids.length > 0) {
      const updateData: { isRead?: boolean; status?: string } = {};
      if (typeof parse.data.isRead === "boolean") {
        updateData.isRead = parse.data.isRead;
        if (parse.data.isRead && !parse.data.status) {
          updateData.status = "Read";
        }
      }
      if (parse.data.status) {
        updateData.status = parse.data.status;
      }

      await prisma.contactMessage.updateMany({
        where: { id: { in: parse.data.ids } },
        data: updateData,
      });

      return apiResponse({ message: "Messages updated successfully" });
    }

    // Single message update
    if (!parse.data.id) {
      return apiError("Message ID is required", 400);
    }

    const updateData: { isRead?: boolean; status?: string } = {};
    if (typeof parse.data.isRead === "boolean") {
      updateData.isRead = parse.data.isRead;
      if (parse.data.isRead && !parse.data.status) {
        updateData.status = "Read";
      } else if (!parse.data.isRead && !parse.data.status) {
        updateData.status = "Unread";
      }
    }
    if (parse.data.status) {
      updateData.status = parse.data.status;
      if (parse.data.status === "Read" || parse.data.status === "Responded" || parse.data.status === "Archived") {
        updateData.isRead = true;
      } else if (parse.data.status === "Unread") {
        updateData.isRead = false;
      }
    }

    const updated = await prisma.contactMessage.update({
      where: { id: parse.data.id },
      data: updateData,
    });

    const unreadCount = await prisma.contactMessage.count({
      where: { isRead: false },
    });

    return apiResponse({ message: updated, unreadCount });
  } catch (error) {
    console.error("[CONTACT_MESSAGES_PATCH]", error);
    return apiError(error instanceof Error ? error.message : "Failed to update contact message", 400);
  }
}

export async function DELETE(req: Request) {
  try {
    await requirePermission("VIEW_ENQUIRIES");
    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return apiError("Invalid contact message ID", 400);
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    const unreadCount = await prisma.contactMessage.count({
      where: { isRead: false },
    });

    return apiResponse({ message: "Contact message deleted successfully", unreadCount });
  } catch (error) {
    console.error("[CONTACT_MESSAGES_DELETE]", error);
    return apiError(error instanceof Error ? error.message : "Failed to delete contact message", 400);
  }
}
