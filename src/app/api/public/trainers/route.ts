import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedWebsiteDataIfEmpty();
    const trainers = await prisma.websiteTrainer.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const formatted = trainers.map((t) => ({
      id: t.slug || t.id,
      dbId: t.id,
      name: t.name,
      role: t.role,
      img: t.img,
      experience: t.experience,
      skills: (() => {
        try { return JSON.parse(t.skills); } catch { return []; }
      })(),
      certifications: (() => {
        try { return JSON.parse(t.certifications); } catch { return []; }
      })(),
      achievements: (() => {
        try { return JSON.parse(t.achievements); } catch { return []; }
      })(),
      bio: t.bio,
      email: t.email,
      phone: t.phone || "",
      socialLinks: (() => {
        try { return t.socialLinks ? JSON.parse(t.socialLinks) : {}; } catch { return {}; }
      })(),
    }));

    return NextResponse.json(formatted, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Public trainers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch trainers" }, { status: 500 });
  }
}
