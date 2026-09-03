import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await seedWebsiteDataIfEmpty();
    const { id } = params;

    const trainer = await prisma.websiteTrainer.findFirst({
      where: {
        OR: [
          { slug: id },
          { id: id }
        ],
        isActive: true,
      },
    });

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    const formatted = {
      id: trainer.slug || trainer.id,
      dbId: trainer.id,
      name: trainer.name,
      role: trainer.role,
      img: trainer.img,
      experience: trainer.experience,
      skills: (() => {
        try { return JSON.parse(trainer.skills); } catch { return []; }
      })(),
      certifications: (() => {
        try { return JSON.parse(trainer.certifications); } catch { return []; }
      })(),
      achievements: (() => {
        try { return JSON.parse(trainer.achievements); } catch { return []; }
      })(),
      bio: trainer.bio,
      email: trainer.email,
      phone: trainer.phone || "",
      socialLinks: (() => {
        try { return trainer.socialLinks ? JSON.parse(trainer.socialLinks) : {}; } catch { return {}; }
      })(),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Public single trainer fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch trainer" }, { status: 500 });
  }
}
