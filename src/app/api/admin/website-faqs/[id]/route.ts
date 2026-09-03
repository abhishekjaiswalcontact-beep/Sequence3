import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner, apiResponse, apiError } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireOwner();
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.websiteFAQ.findUnique({ where: { id } });
    if (!existing) {
      return apiError("FAQ not found", 404);
    }

    const { category, question, answer, popular, videoUrl, order, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (category !== undefined) updateData.category = category.trim();
    if (question !== undefined) updateData.question = question.trim();
    if (answer !== undefined) updateData.answer = answer.trim();
    if (popular !== undefined) updateData.popular = Boolean(popular);
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl.trim();
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.websiteFAQ.update({
      where: { id },
      data: updateData,
    });

    return apiResponse(updated);
  } catch (error: unknown) {
    console.error("[ADMIN_FAQ_PUT]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireOwner();
    const { id } = params;

    const existing = await prisma.websiteFAQ.findUnique({ where: { id } });
    if (!existing) {
      return apiError("FAQ not found", 404);
    }

    await prisma.websiteFAQ.delete({ where: { id } });

    return apiResponse({ message: "FAQ deleted successfully" });
  } catch (error: unknown) {
    console.error("[ADMIN_FAQ_DELETE]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}
