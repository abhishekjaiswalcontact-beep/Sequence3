import { requirePermission, apiResponse, apiError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const CreateEnquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(5),
  source: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

const UpdateEnquirySchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

export async function GET() {
  try {
    await requirePermission("VIEW_ENQUIRIES");

    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return apiResponse(enquiries);
  } catch (error) {
    console.error("[ENQUIRIES_GET]", error);
    return apiError(error instanceof Error ? error.message : "Unauthorized", 403);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission("VIEW_ENQUIRIES");
    const body = await req.json();
    const parse = CreateEnquirySchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid enquiry details", 400);
    }

    const newEnquiry = await prisma.enquiry.create({
      data: {
        name: parse.data.name,
        email: parse.data.email || "",
        phone: parse.data.phone,
        source: parse.data.source || "Walk-in",
        status: parse.data.status || "Pending",
        notes: parse.data.notes || "",
        assignedTo: parse.data.assignedTo || "",
      },
    });

    return apiResponse(newEnquiry, 201);
  } catch (error) {
    console.error("[ENQUIRIES_POST]", error);
    return apiError(error instanceof Error ? error.message : "Failed to create enquiry", 400);
  }
}

export async function PATCH(req: Request) {
  try {
    await requirePermission("VIEW_ENQUIRIES");
    const body = await req.json();
    const parse = UpdateEnquirySchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid enquiry update data", 400);
    }

    const { id, ...data } = parse.data;

    const updated = await prisma.enquiry.update({
      where: { id },
      data,
    });

    return apiResponse(updated);
  } catch (error) {
    console.error("[ENQUIRIES_PATCH]", error);
    return apiError(error instanceof Error ? error.message : "Failed to update enquiry", 400);
  }
}

export async function DELETE(req: Request) {
  try {
    await requirePermission("VIEW_ENQUIRIES");
    const { id } = await req.json();

    if (!id || typeof id !== "number") {
      return apiError("Invalid enquiry ID", 400);
    }

    await prisma.enquiry.delete({ where: { id } });
    return apiResponse({ message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("[ENQUIRIES_DELETE]", error);
    return apiError(error instanceof Error ? error.message : "Failed to delete enquiry", 400);
  }
}
