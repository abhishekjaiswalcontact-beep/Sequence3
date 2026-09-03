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

    const existing = await prisma.websiteGalleryItem.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Gallery item not found", 404);
    }

    const { category, title, src, caption, order, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (category !== undefined) updateData.category = category.trim();
    if (title !== undefined) updateData.title = title.trim();
    if (src !== undefined) updateData.src = src.trim();
    if (caption !== undefined) updateData.caption = caption.trim();
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.websiteGalleryItem.update({
      where: { id },
      data: updateData,
    });

    return apiResponse(updated);
  } catch (error: unknown) {
    console.error("[ADMIN_GALLERY_PUT]", error);
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

    const existing = await prisma.websiteGalleryItem.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Gallery item not found", 404);
    }

    await prisma.websiteGalleryItem.delete({ where: { id } });

    return apiResponse({ message: "Gallery item deleted successfully" });
  } catch (error: unknown) {
    console.error("[ADMIN_GALLERY_DELETE]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}
