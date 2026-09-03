import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner, apiResponse, apiError } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET() {
  try {
    await requireOwner();
    const media = await prisma.mediaUpload.findMany({
      orderBy: { createdAt: "desc" },
    });
    return apiResponse(media);
  } catch (error: unknown) {
    console.error("[ADMIN_MEDIA_GET]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireOwner();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const altText = (formData.get("altText") as string) || "";

    if (!file) {
      return apiError("No file uploaded", 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return apiError(
        `Invalid file type: ${file.type}. Allowed formats: JPG, PNG, WebP, GIF, SVG`,
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("File size exceeds 10MB limit", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create target directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate safe clean filename
    const originalExt = path.extname(file.name) || ".png";
    const baseCleanName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const finalFilename = `${baseCleanName}-${uniqueSuffix}${originalExt}`;
    const filePath = path.join(uploadsDir, finalFilename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${finalFilename}`;

    const mediaRecord = await prisma.mediaUpload.create({
      data: {
        filename: finalFilename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        altText,
        folder,
      },
    });

    return apiResponse(
      {
        message: "File uploaded successfully",
        url: publicUrl,
        media: mediaRecord,
      },
      201
    );
  } catch (error: unknown) {
    console.error("[ADMIN_UPLOAD_POST]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireOwner();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return apiError("Media ID is required", 400);
    }

    const record = await prisma.mediaUpload.findUnique({ where: { id } });
    if (!record) {
      return apiError("Media record not found", 404);
    }

    // Attempt to delete physical file
    const filePath = path.join(process.cwd(), "public", "uploads", record.filename);
    try {
      await fs.unlink(filePath);
    } catch {
      // File may have already been removed
    }

    await prisma.mediaUpload.delete({ where: { id } });

    return apiResponse({ message: "Media deleted successfully" });
  } catch (error: unknown) {
    console.error("[ADMIN_MEDIA_DELETE]", error);
    const msg = error instanceof Error ? error.message : "Owner authorization required";
    return apiError(msg, 403);
  }
}
