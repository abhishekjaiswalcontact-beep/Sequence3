import { prisma } from "@/lib/prisma";
import { requirePermission, apiResponse, apiError, NON_OWNER_USER_FILTER, isOwnerUser } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const CreateMembershipSchema = z.object({
  userId: z.number(),
  plan: z.string(), // Monthly, Quarterly (3 Months), Half Yearly (6 Months), Yearly, Custom
  startDate: z.string(),
  customEndDate: z.string().nullable().optional(),
  amountPaid: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  paymentStatus: z.string(), // Paid, Pending, Partial
  paymentMode: z.string(), // Cash, UPI, Card, Bank Transfer
  personalTrainerIncluded: z.boolean(),
  ptStartDate: z.string().nullable().optional(),
  ptEndDate: z.string().nullable().optional(),
  ptTrainerName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  status: z.string().default("Active"), // Active, Expired, Upcoming, Frozen, Cancelled
});

const UpdateMembershipSchema = z.object({
  id: z.number(),
  plan: z.string().optional(),
  startDate: z.string().optional(),
  customEndDate: z.string().nullable().optional(),
  amountPaid: z.number().nonnegative().optional(),
  totalAmount: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  paymentStatus: z.string().optional(),
  paymentMode: z.string().optional(),
  personalTrainerIncluded: z.boolean().optional(),
  ptStartDate: z.string().nullable().optional(),
  ptEndDate: z.string().nullable().optional(),
  ptTrainerName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  status: z.string().optional(),
});

function calculateMembershipDates(plan: string, startDateStr: string, customEndDateStr?: string | null) {
  const start = new Date(startDateStr);
  let end = new Date(start);

  if (plan === "Monthly") {
    end.setMonth(start.getMonth() + 1);
  } else if (plan === "Quarterly (3 Months)") {
    end.setMonth(start.getMonth() + 3);
  } else if (plan === "Half Yearly (6 Months)") {
    end.setMonth(start.getMonth() + 6);
  } else if (plan === "Yearly") {
    end.setFullYear(start.getFullYear() + 1);
  } else if (plan === "Custom" && customEndDateStr) {
    end = new Date(customEndDateStr);
  } else {
    // Fallback default duration (1 month)
    end.setMonth(start.getMonth() + 1);
  }

  // Set hours to cover boundaries
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const duration = `${durationDays} Days`;

  return {
    startDate: start,
    endDate: end,
    duration,
    renewalDate: end,
    expiryDate: end,
  };
}

function determineStatus(startDate: Date, endDate: Date, currentStatus: string) {
  if (currentStatus === "Frozen" || currentStatus === "Cancelled") {
    return currentStatus;
  }

  const now = new Date();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (now > end) {
    return "Expired";
  } else if (now < start) {
    return "Upcoming";
  } else {
    return "Active";
  }
}

async function generateUniqueMembershipId() {
  let unique = false;
  let membershipId = "";
  while (!unique) {
    membershipId = "MEM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await prisma.membership.findUnique({
      where: { membershipId }
    });
    if (!existing) unique = true;
  }
  return membershipId;
}

// ----------------------------------------------------
// GET /api/admin/memberships (List memberships)
// ----------------------------------------------------
export async function GET(req: Request) {
  try {
    await requirePermission("MANAGE_MEMBERSHIPS");

    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    const query = searchParams.get("query") || "";

    const userConditions: Prisma.UserWhereInput[] = [NON_OWNER_USER_FILTER];

    if (userIdParam) {
      const targetUser = await prisma.user.findUnique({
        where: { id: Number(userIdParam) },
        select: { id: true, isOwner: true, role: true },
      });
      if (!targetUser || isOwnerUser(targetUser)) {
        return apiResponse([]);
      }
    }

    if (query) {
      userConditions.push({
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      });
    }

    const whereClause: Prisma.MembershipWhereInput = {
      user: {
        AND: userConditions,
      },
    };

    if (userIdParam) {
      whereClause.userId = Number(userIdParam);
    }

    // Auto-update expired memberships first
    const now = new Date();
    const activeOrUpcoming = await prisma.membership.findMany({
      where: {
        status: { in: ["Active", "Upcoming"] },
      },
    });

    for (const membership of activeOrUpcoming) {
      if (now > new Date(membership.endDate)) {
        await prisma.membership.update({
          where: { id: membership.id },
          data: { status: "Expired" },
        });
      }
    }

    const memberships = await prisma.membership.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Usually groups Active at top since 'A' < 'E'/'F'
        { startDate: "desc" },
        { createdAt: "desc" },
      ],
    });

    return apiResponse(memberships);
  } catch (error) {
    console.error("[ADMIN_GET_MEMBERSHIPS]", error);
    return apiError("Unauthorized or failed to load memberships", 403);
  }
}

// ----------------------------------------------------
// POST /api/admin/memberships (Create membership)
// ----------------------------------------------------
export async function POST(req: Request) {
  try {
    await requirePermission("MANAGE_MEMBERSHIPS");
    const body = await req.json();
    const parse = CreateMembershipSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid data format: " + parse.error.issues.map(i => i.message).join(", "), 400);
    }

    const data = parse.data;

    // Check user exists and is not owner
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user || isOwnerUser(user)) return apiError("User not found or access denied", 404);

    // Calculate dates & duration
    const dateCalcs = calculateMembershipDates(data.plan, data.startDate, data.customEndDate);

    // Calculate status
    const status = determineStatus(dateCalcs.startDate, dateCalcs.endDate, data.status);

    // Calculate remaining balance
    const remainingBalance = Math.max(0, data.totalAmount - data.discount - data.amountPaid);

    // Generate unique ID
    const membershipId = await generateUniqueMembershipId();

    // Create the membership in a transaction to enforce single active membership constraints
    const membership = await prisma.$transaction(async (tx) => {
      if (status === "Active") {
        // Set all other active memberships for this user to Expired
        await tx.membership.updateMany({
          where: {
            userId: data.userId,
            status: "Active",
          },
          data: { status: "Expired" },
        });
      }

      return await tx.membership.create({
        data: {
          membershipId,
          userId: data.userId,
          plan: data.plan,
          startDate: dateCalcs.startDate,
          endDate: dateCalcs.endDate,
          duration: dateCalcs.duration,
          status,
          joinDate: new Date(),
          renewalDate: dateCalcs.renewalDate,
          expiryDate: dateCalcs.expiryDate,
          paymentStatus: data.paymentStatus,
          paymentMode: data.paymentMode,
          amountPaid: data.amountPaid,
          totalAmount: data.totalAmount,
          discount: data.discount,
          remainingBalance,
          personalTrainerIncluded: data.personalTrainerIncluded,
          ptStartDate: data.personalTrainerIncluded && data.ptStartDate ? new Date(data.ptStartDate) : null,
          ptEndDate: data.personalTrainerIncluded && data.ptEndDate ? new Date(data.ptEndDate) : null,
          ptTrainerName: data.personalTrainerIncluded ? data.ptTrainerName : null,
          notes: data.notes,
          remarks: data.remarks,
        },
      });
    });

    return apiResponse({ message: "Membership created successfully", membership });
  } catch (error) {
    console.error("[ADMIN_CREATE_MEMBERSHIP]", error);
    return apiError("Failed to create membership", 500);
  }
}

// ----------------------------------------------------
// PATCH /api/admin/memberships (Update / Renew / Upgrade membership)
// ----------------------------------------------------
export async function PATCH(req: Request) {
  try {
    await requirePermission("MANAGE_MEMBERSHIPS");
    const body = await req.json();
    const parse = UpdateMembershipSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid data format: " + parse.error.issues.map(i => i.message).join(", "), 400);
    }

    const data = parse.data;

    // Fetch existing
    const existing = await prisma.membership.findUnique({
      where: { id: data.id },
      include: { user: true },
    });
    if (!existing || isOwnerUser(existing.user)) {
      return apiError("Membership not found or access denied", 404);
    }

    // Merge date values
    const planVal = data.plan ?? existing.plan;
    const startDateVal = data.startDate ?? existing.startDate.toISOString();
    const customEndDateVal = data.customEndDate !== undefined 
      ? data.customEndDate 
      : (existing.plan === "Custom" ? existing.endDate.toISOString() : null);

    const dateCalcs = calculateMembershipDates(planVal, startDateVal, customEndDateVal);

    // Merge financial values
    const totalAmountVal = data.totalAmount ?? existing.totalAmount;
    const discountVal = data.discount ?? existing.discount;
    const amountPaidVal = data.amountPaid ?? existing.amountPaid;
    const remainingBalance = Math.max(0, totalAmountVal - discountVal - amountPaidVal);

    // Merge status values
    const statusVal = data.status ?? existing.status;
    const status = determineStatus(dateCalcs.startDate, dateCalcs.endDate, statusVal);

    // Merge PT info
    const ptIncluded = data.personalTrainerIncluded !== undefined ? data.personalTrainerIncluded : existing.personalTrainerIncluded;
    const ptStartDateVal = ptIncluded 
      ? (data.ptStartDate !== undefined ? (data.ptStartDate ? new Date(data.ptStartDate) : null) : existing.ptStartDate)
      : null;
    const ptEndDateVal = ptIncluded 
      ? (data.ptEndDate !== undefined ? (data.ptEndDate ? new Date(data.ptEndDate) : null) : existing.ptEndDate)
      : null;
    const ptTrainerVal = ptIncluded 
      ? (data.ptTrainerName !== undefined ? data.ptTrainerName : existing.ptTrainerName)
      : null;

    // Execute update in transaction
    const updated = await prisma.$transaction(async (tx) => {
      if (status === "Active") {
        // Set all other active memberships for this user to Expired
        await tx.membership.updateMany({
          where: {
            userId: existing.userId,
            status: "Active",
            id: { not: existing.id }
          },
          data: { status: "Expired" },
        });
      }

      return await tx.membership.update({
        where: { id: existing.id },
        data: {
          plan: planVal,
          startDate: dateCalcs.startDate,
          endDate: dateCalcs.endDate,
          duration: dateCalcs.duration,
          status,
          renewalDate: dateCalcs.renewalDate,
          expiryDate: dateCalcs.expiryDate,
          paymentStatus: data.paymentStatus ?? existing.paymentStatus,
          paymentMode: data.paymentMode ?? existing.paymentMode,
          amountPaid: amountPaidVal,
          totalAmount: totalAmountVal,
          discount: discountVal,
          remainingBalance,
          personalTrainerIncluded: ptIncluded,
          ptStartDate: ptStartDateVal,
          ptEndDate: ptEndDateVal,
          ptTrainerName: ptTrainerVal,
          notes: data.notes !== undefined ? data.notes : existing.notes,
          remarks: data.remarks !== undefined ? data.remarks : existing.remarks,
        },
      });
    });

    return apiResponse({ message: "Membership updated successfully", membership: updated });
  } catch (error) {
    console.error("[ADMIN_UPDATE_MEMBERSHIP]", error);
    return apiError("Failed to update membership", 500);
  }
}

