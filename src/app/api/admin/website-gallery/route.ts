import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner, apiResponse, apiError } from "@/lib/auth";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireOwner();
    await seedWebsiteDataIfEmpty();

    const items = await prisma.websiteGalleryItem.findMany({
      orderBy: { order: "asc" },
    });

    return apiResponse(items);
  } catch (error: unknown) {
    console.error("[ADMIN_GALLERY_GET]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireOwner();
    const body = await req.json();

    const { category, title, src, caption, order, isActive } = body;

    if (!title || !src) {
      return apiError("Title and image source are required", 400);
    }

    const item = await prisma.websiteGalleryItem.create({
      data: {
        category: category?.trim() || "Workout",
        title: title.trim(),
        src: src.trim(),
        caption: caption?.trim() || "",
        order: typeof order === "number" ? order : 0,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });

    return apiResponse(item, 201);
  } catch (error: unknown) {
    console.error("[ADMIN_GALLERY_POST]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}
