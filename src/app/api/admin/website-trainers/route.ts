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
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export async function GET() {
  try {
    await requireOwner();
    await seedWebsiteDataIfEmpty();

    const trainers = await prisma.websiteTrainer.findMany({
      orderBy: { order: "asc" },
    });

    return apiResponse(trainers);
  } catch (error: unknown) {
    console.error("[ADMIN_TRAINERS_GET]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireOwner();
    const body = await req.json();

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

    if (!name || !role) {
      return apiError("Name and role are required", 400);
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.websiteTrainer.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const trainer = await prisma.websiteTrainer.create({
      data: {
        slug,
        name: name.trim(),
        role: role.trim(),
        img: img?.trim() || "/showcase/trainer1.png",
        experience: experience?.trim() || "1 Year",
        skills: typeof skills === "string" ? skills : JSON.stringify(skills || []),
        certifications: typeof certifications === "string" ? certifications : JSON.stringify(certifications || []),
        achievements: typeof achievements === "string" ? achievements : JSON.stringify(achievements || []),
        bio: bio?.trim() || "",
        email: email?.trim() || "",
        phone: phone?.trim() || "",
        socialLinks: typeof socialLinks === "string" ? socialLinks : JSON.stringify(socialLinks || {}),
        order: typeof order === "number" ? order : 0,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });

    return apiResponse(trainer, 201);
  } catch (error: unknown) {
    console.error("[ADMIN_TRAINER_POST]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}
