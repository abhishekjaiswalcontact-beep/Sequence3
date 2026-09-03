import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedWebsiteDataIfEmpty();
    const faqs = await prisma.websiteFAQ.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const formatted = faqs.map((f, idx) => ({
      id: idx + 1,
      dbId: f.id,
      category: f.category,
      popular: f.popular,
      question: f.question,
      answer: f.answer,
      videoUrl: f.videoUrl || "",
    }));

    return NextResponse.json(formatted, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Public FAQs fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}
