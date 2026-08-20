import { prisma } from "@/lib/prisma";
import { requireOwner, apiError, apiResponse } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";

const CreateSalarySchema = z.object({
  staffId: z.number(),
  month: z.string(), // e.g. "2026-08" or "August 2026"
  year: z.number(),
  baseSalary: z.number(),
  incentiveAmount: z.number().default(0),
  otherPayment: z.number().default(0),
  paymentStatus: z.enum(["Paid", "Pending"]).default("Pending"),
  paymentDate: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const UpdateStatusSchema = z.object({
  salaryId: z.number(),
  paymentStatus: z.enum(["Paid", "Pending"]),
  paymentDate: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    await requireOwner();

    const { searchParams } = new URL(req.url);
    const monthFilter = searchParams.get("month") || "";
    const yearFilter = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : undefined;

    const whereConditions: Record<string, unknown>[] = [];
    if (monthFilter) whereConditions.push({ month: monthFilter });
    if (yearFilter) whereConditions.push({ year: yearFilter });

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const salaryRecords = await prisma.staffSalary.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            department: true,
            monthlySalary: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const totalSalaryExpense = salaryRecords
      .filter(s => s.paymentStatus === "Paid")
      .reduce((acc, s) => acc + s.totalPayable, 0);

    const pendingSalaryExpense = salaryRecords
      .filter(s => s.paymentStatus === "Pending")
      .reduce((acc, s) => acc + s.totalPayable, 0);

    return apiResponse({
      salaryRecords,
      totalSalaryExpense,
      pendingSalaryExpense,
    });
  } catch (error) {
    console.error("[OWNER_SALARIES_GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();
    const parse = CreateSalarySchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid input: " + parse.error.issues.map(i => i.message).join(", "), 400);
    }

    const { staffId, month, year, baseSalary, incentiveAmount, otherPayment, paymentStatus, paymentDate, paymentMethod, notes } = parse.data;

    const totalPayable = baseSalary + incentiveAmount + otherPayment;

    const salaryRecord = await prisma.staffSalary.create({
      data: {
        staffId,
        month,
        year,
        baseSalary,
        incentiveAmount,
        otherPayment,
        totalPayable,
        paymentStatus,
        paymentDate: paymentDate ? new Date(paymentDate) : (paymentStatus === "Paid" ? new Date() : null),
        paymentMethod: paymentMethod || "Bank Transfer",
        notes,
      },
      include: { staff: true }
    });

    // Also record under general expenses if marked as paid
    if (paymentStatus === "Paid") {
      await prisma.expense.create({
        data: {
          category: "Staff Salary",
          amount: totalPayable,
          date: paymentDate ? new Date(paymentDate) : new Date(),
          month,
          year,
          paymentStatus: "Paid",
          paymentMode: paymentMethod || "Bank Transfer",
          description: `Monthly salary payout for ${salaryRecord.staff.name} (${month})`,
        }
      }).catch(() => {});
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "SALARY_CHANGED",
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: "OWNER",
        targetRecordId: String(salaryRecord.id),
        targetRecordType: "STAFF_SALARY",
        description: `Owner created salary record for ${salaryRecord.staff.name} for ${month} (Total ₹${totalPayable}, Status: ${paymentStatus}).`,
      }
    }).catch(() => {});

    return apiResponse({ message: "Salary record saved successfully.", salaryRecord });
  } catch (error) {
    console.error("[OWNER_SALARIES_POST]", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();
    const parse = UpdateStatusSchema.safeParse(body);

    if (!parse.success) return apiError("Invalid parameters", 400);

    const { salaryId, paymentStatus, paymentDate, paymentMethod } = parse.data;

    const salaryRecord = await prisma.staffSalary.update({
      where: { id: salaryId },
      data: {
        paymentStatus,
        paymentDate: paymentDate ? new Date(paymentDate) : (paymentStatus === "Paid" ? new Date() : null),
        ...(paymentMethod ? { paymentMethod } : {}),
      },
      include: { staff: true }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: "SALARY_PAID",
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: "OWNER",
        targetRecordId: String(salaryId),
        targetRecordType: "STAFF_SALARY",
        description: `Owner marked salary of ${salaryRecord.staff.name} as ${paymentStatus}.`,
      }
    }).catch(() => {});

    return apiResponse({ message: `Salary marked as ${paymentStatus}.`, salaryRecord });
  } catch (error) {
    console.error("[OWNER_SALARIES_PATCH]", error);
    return apiError("Internal server error", 500);
  }
}
