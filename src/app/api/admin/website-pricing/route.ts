import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner, apiResponse, apiError } from "@/lib/auth";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const runtime = "nodejs";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "_");
}

export async function GET() {
  try {
    await requireOwner();
    await seedWebsiteDataIfEmpty();

    const plans = await prisma.websitePricingPlan.findMany({
      orderBy: { order: "asc" },
    });

    const amenitiesContent = await prisma.websiteSectionContent.findUnique({
      where: { sectionKey: "amenities" },
    });

    let features: unknown[] = [];
    if (amenitiesContent) {
      try { features = JSON.parse(amenitiesContent.content); } catch {}
    }

    return apiResponse({ plans, features });
  } catch (error: unknown) {
    console.error("[ADMIN_PRICING_GET]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireOwner();
    const body = await req.json();

    const {
      title,
      price,
      period,
      subtitle,
      savings,
      popular,
      badge,
      gradient,
      buttonText,
      buttonLink,
      features,
      order,
      isActive,
    } = body;

    if (!title || !price) {
      return apiError("Title and price are required", 400);
    }

    const baseSlug = slugify(title);
    let planId = baseSlug;
    let counter = 1;
    while (await prisma.websitePricingPlan.findUnique({ where: { planId } })) {
      planId = `${baseSlug}_${counter}`;
      counter++;
    }

    const plan = await prisma.websitePricingPlan.create({
      data: {
        planId,
        title: title.trim(),
        price: String(price).trim(),
        period: period?.trim() || "month",
        subtitle: subtitle?.trim() || "",
        savings: savings?.trim() || "",
        popular: !!popular,
        badge: badge?.trim() || "",
        gradient: gradient?.trim() || "from-brand to-purple-900",
        buttonText: buttonText?.trim() || "Join Now",
        buttonLink: buttonLink?.trim() || "/#contact",
        features: features ? (typeof features === "string" ? features : JSON.stringify(features)) : null,
        order: typeof order === "number" ? order : 0,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });

    return apiResponse(plan, 201);
  } catch (error: unknown) {
    console.error("[ADMIN_PRICING_POST]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}
