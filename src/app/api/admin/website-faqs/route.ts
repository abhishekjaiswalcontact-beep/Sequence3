import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner, apiResponse, apiError } from "@/lib/auth";
import { seedWebsiteDataIfEmpty } from "@/lib/seedWebsiteData";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireOwner();
    await seedWebsiteDataIfEmpty();

    const faqs = await prisma.websiteFAQ.findMany({
      orderBy: { order: "asc" },
    });

    return apiResponse(faqs);
  } catch (error: unknown) {
    console.error("[ADMIN_FAQS_GET]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireOwner();
    const body = await req.json();

    const { category, question, answer, popular, videoUrl, order, isActive } = body;

    if (!question || !answer) {
      return apiError("Question and answer are required", 400);
    }

    const faq = await prisma.websiteFAQ.create({
      data: {
        category: category?.trim() || "General",
        question: question.trim(),
        answer: answer.trim(),
        popular: !!popular,
        videoUrl: videoUrl?.trim() || "",
        order: typeof order === "number" ? order : 0,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });

    return apiResponse(faq, 201);
  } catch (error: unknown) {
    console.error("[ADMIN_FAQS_POST]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}
