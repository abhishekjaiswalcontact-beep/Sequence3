import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await seedWebsiteDataIfEmpty();
    const section = request.nextUrl.searchParams.get("section");

    if (section) {
      const row = await prisma.websiteSectionContent.findUnique({
        where: { sectionKey: section },
      });
      if (!row) {
        return NextResponse.json({ error: "Section not found" }, { status: 404 });
      }
      return NextResponse.json(JSON.parse(row.content), {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      });
    }

    const allSections = await prisma.websiteSectionContent.findMany();
    const result: Record<string, unknown> = {};
    for (const s of allSections) {
      try {
        result[s.sectionKey] = JSON.parse(s.content);
      } catch {
        result[s.sectionKey] = s.content;
      }
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Public content fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
