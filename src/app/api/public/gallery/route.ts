import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedWebsiteDataIfEmpty();
    const items = await prisma.websiteGalleryItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const formatted = items.map((item, idx) => ({
      id: item.id,
      numericId: idx + 1,
      category: item.category,
      title: item.title,
      src: item.src,
      caption: item.caption,
    }));

    return NextResponse.json(formatted, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Public gallery fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 });
  }
}
