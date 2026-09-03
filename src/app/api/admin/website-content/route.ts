import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner, apiResponse, apiError } from "@/lib/auth";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireOwner();
    await seedWebsiteDataIfEmpty();

    const sectionKey = req.nextUrl.searchParams.get("section");

    if (sectionKey) {
      const row = await prisma.websiteSectionContent.findUnique({
        where: { sectionKey },
      });
      if (!row) {
        return apiError("Section not found", 404);
      }
      return apiResponse({
        sectionKey: row.sectionKey,
        content: JSON.parse(row.content),
        updatedAt: row.updatedAt,
      });
    }

    const all = await prisma.websiteSectionContent.findMany();
    const result: Record<string, unknown> = {};
    for (const item of all) {
      try {
        result[item.sectionKey] = JSON.parse(item.content);
      } catch {
        result[item.sectionKey] = item.content;
      }
    }

    return apiResponse(result);
  } catch (error: unknown) {
    console.error("[ADMIN_CONTENT_GET]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireOwner();
    const body = await req.json();

    const { sectionKey, content } = body;
    if (!sectionKey || !content) {
      return apiError("sectionKey and content are required", 400);
    }

    const stringified = typeof content === "string" ? content : JSON.stringify(content);

    const updated = await prisma.websiteSectionContent.upsert({
      where: { sectionKey },
      create: { sectionKey, content: stringified },
      update: { content: stringified },
    });

    return apiResponse({
      sectionKey: updated.sectionKey,
      content: JSON.parse(updated.content),
      updatedAt: updated.updatedAt,
    });
  } catch (error: unknown) {
    console.error("[ADMIN_CONTENT_PUT]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}
