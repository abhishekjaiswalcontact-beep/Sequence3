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

    const existing = await prisma.websitePricingPlan.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Pricing plan not found", 404);
    }

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

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (price !== undefined) updateData.price = String(price).trim();
    if (period !== undefined) updateData.period = period.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle.trim();
    if (savings !== undefined) updateData.savings = savings.trim();
    if (popular !== undefined) updateData.popular = Boolean(popular);
    if (badge !== undefined) updateData.badge = badge.trim();
    if (gradient !== undefined) updateData.gradient = gradient.trim();
    if (buttonText !== undefined) updateData.buttonText = buttonText.trim();
    if (buttonLink !== undefined) updateData.buttonLink = buttonLink.trim();
    if (features !== undefined) {
      updateData.features = typeof features === "string" ? features : JSON.stringify(features);
    }
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.websitePricingPlan.update({
      where: { id },
      data: updateData,
    });

    return apiResponse(updated);
  } catch (error: unknown) {
    console.error("[ADMIN_PRICING_PUT]", error);
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

    const existing = await prisma.websitePricingPlan.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Pricing plan not found", 404);
    }

    await prisma.websitePricingPlan.delete({ where: { id } });

    return apiResponse({ message: "Pricing plan deleted successfully" });
  } catch (error: unknown) {
    console.error("[ADMIN_PRICING_DELETE]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}
