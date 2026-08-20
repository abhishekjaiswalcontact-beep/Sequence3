import { requirePermission, apiResponse, apiError, NON_OWNER_USER_FILTER, isOwnerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const CreateComplaintSchema = z.object({
  userId: z.number().optional(),
  memberName: z.string().min(2),
  subject: z.string().min(3),
  description: z.string().min(5),
  priority: z.string().optional(),
  status: z.string().optional(),
  resolution: z.string().optional(),
});

const UpdateComplaintSchema = z.object({
  id: z.number(),
  subject: z.string().optional(),
  description: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  resolution: z.string().optional(),
});

export async function GET() {
  try {
    await requirePermission("MANAGE_COMPLAINTS");

    const complaints = await prisma.complaint.findMany({
      where: {
        OR: [
          { userId: null },
          { user: NON_OWNER_USER_FILTER },
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse(complaints);
  } catch (error) {
    console.error("[COMPLAINTS_GET]", error);
    return apiError(error instanceof Error ? error.message : "Unauthorized", 403);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission("MANAGE_COMPLAINTS");
    const body = await req.json();
    const parse = CreateComplaintSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid complaint details", 400);
    }

    if (parse.data.userId) {
      const targetUser = await prisma.user.findUnique({ where: { id: parse.data.userId } });
      if (!targetUser || isOwnerUser(targetUser)) {
        return apiError("User not found or access denied", 404);
      }
    }

    const newComplaint = await prisma.complaint.create({
      data: {
        userId: parse.data.userId || null,
        memberName: parse.data.memberName,
        subject: parse.data.subject,
        description: parse.data.description,
        priority: parse.data.priority || "Medium",
        status: parse.data.status || "Open",
        resolution: parse.data.resolution || "",
      },
    });

    return apiResponse(newComplaint, 201);
  } catch (error) {
    console.error("[COMPLAINTS_POST]", error);
    return apiError(error instanceof Error ? error.message : "Failed to create complaint", 400);
  }
}

export async function PATCH(req: Request) {
  try {
    await requirePermission("MANAGE_COMPLAINTS");
    const body = await req.json();
    const parse = UpdateComplaintSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid complaint update data", 400);
    }

    const { id, ...data } = parse.data;

    const existing = await prisma.complaint.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!existing || (existing.user && isOwnerUser(existing.user))) {
      return apiError("Complaint not found or access denied", 404);
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data,
    });

    return apiResponse(updated);
  } catch (error) {
    console.error("[COMPLAINTS_PATCH]", error);
    return apiError(error instanceof Error ? error.message : "Failed to update complaint", 400);
  }
}

export async function DELETE(req: Request) {
  try {
    await requirePermission("MANAGE_COMPLAINTS");
    const { id } = await req.json();

    if (!id || typeof id !== "number") {
      return apiError("Invalid complaint ID", 400);
    }

    const existing = await prisma.complaint.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!existing || (existing.user && isOwnerUser(existing.user))) {
      return apiError("Complaint not found or access denied", 404);
    }

    await prisma.complaint.delete({ where: { id } });
    return apiResponse({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("[COMPLAINTS_DELETE]", error);
    return apiError(error instanceof Error ? error.message : "Failed to delete complaint", 400);
  }
}

