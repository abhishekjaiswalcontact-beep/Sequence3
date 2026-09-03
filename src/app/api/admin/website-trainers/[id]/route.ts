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

    const existing = await prisma.websiteTrainer.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Trainer not found", 404);
    }

    const {
      name,
      role,
      img,
      experience,
      skills,
      certifications,
      achievements,
      bio,
      email,
      phone,
      socialLinks,
      order,
      isActive,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (role !== undefined) updateData.role = role.trim();
    if (img !== undefined) updateData.img = img.trim();
    if (experience !== undefined) updateData.experience = experience.trim();
    if (skills !== undefined) {
      updateData.skills = typeof skills === "string" ? skills : JSON.stringify(skills);
    }
    if (certifications !== undefined) {
      updateData.certifications = typeof certifications === "string" ? certifications : JSON.stringify(certifications);
    }
    if (achievements !== undefined) {
      updateData.achievements = typeof achievements === "string" ? achievements : JSON.stringify(achievements);
    }
    if (bio !== undefined) updateData.bio = bio.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (socialLinks !== undefined) {
      updateData.socialLinks = typeof socialLinks === "string" ? socialLinks : JSON.stringify(socialLinks);
    }
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.websiteTrainer.update({
      where: { id },
      data: updateData,
    });

    return apiResponse(updated);
  } catch (error: unknown) {
    console.error("[ADMIN_TRAINER_PUT]", error);
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

    const existing = await prisma.websiteTrainer.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Trainer not found", 404);
    }

    await prisma.websiteTrainer.delete({ where: { id } });

    return apiResponse({ message: "Trainer deleted successfully" });
  } catch (error: unknown) {
    console.error("[ADMIN_TRAINER_DELETE]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}
