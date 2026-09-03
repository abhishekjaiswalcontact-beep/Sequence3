import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedWebsiteDataIfEmpty();
    const plans = await prisma.websitePricingPlan.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const amenitiesContent = await prisma.websiteSectionContent.findUnique({
      where: { sectionKey: "amenities" },
    });

    let features: Array<{ name: string; icon: string }> = [];
    if (amenitiesContent) {
      try {
        features = JSON.parse(amenitiesContent.content);
      } catch {
        features = [];
      }
    }

    const formattedPlans = plans.map((p) => ({
      id: p.planId || p.id,
      dbId: p.id,
      title: p.title,
      price: p.price,
      period: p.period,
      subtitle: p.subtitle,
      savings: p.savings || "",
      popular: p.popular,
      badge: p.badge || (p.popular ? "Most Popular" : ""),
      gradient: p.gradient,
      buttonText: p.buttonText,
      buttonLink: p.buttonLink,
    }));

    return NextResponse.json(
      {
        plans: formattedPlans,
        features,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Public pricing fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch pricing plans" }, { status: 500 });
  }
}
