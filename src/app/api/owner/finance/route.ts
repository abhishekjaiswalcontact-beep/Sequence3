import { prisma } from "@/lib/prisma";
import { requireOwner, apiResponse, apiError } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateExpenseSchema = z.object({
  category: z.string().default("Other"),
  amount: z.number().positive(),
  date: z.string().optional(),
  month: z.string(),
  year: z.number(),
  paymentStatus: z.string().default("Paid"),
  paymentMode: z.string().default("Cash"),
  description: z.string().min(1),
  receiptUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const UpdateExpenseSchema = z.object({
  id: z.number(),
  category: z.string().optional(),
  amount: z.number().positive().optional(),
  date: z.string().optional(),
  month: z.string().optional(),
  year: z.number().optional(),
  paymentStatus: z.string().optional(),
  paymentMode: z.string().optional(),
  description: z.string().optional(),
  receiptUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const CreateRevenueSchema = z.object({
  category: z.string(),
  amount: z.number().positive(),
  source: z.string().optional(),
  date: z.string().optional(),
  month: z.string(),
  year: z.number(),
  paymentMode: z.string().default("Cash"),
  referenceId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const CreateRentSchema = z.object({
  month: z.string(),
  year: z.number(),
  monthlyRent: z.number().min(1),
  landlordInfo: z.string().optional().nullable(),
  dueDate: z.string(),
  paymentDate: z.string().optional().nullable(),
  paymentStatus: z.string(),
  amountPaid: z.number().min(0),
  paymentMethod: z.string().default("Bank Transfer"),
  notes: z.string().optional().nullable(),
});

const CreateElectricitySchema = z.object({
  month: z.string(),
  year: z.number(),
  billAmount: z.number().min(1),
  dueDate: z.string(),
  paymentDate: z.string().optional().nullable(),
  paymentStatus: z.string(),
  meterReading: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
  billNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    await requireOwner();

    // 1. Revenues
    const membershipRevenues = await prisma.membership.findMany({
      select: {
        id: true,
        membershipId: true,
        plan: true,
        amountPaid: true,
        paymentStatus: true,
        paymentMode: true,
        createdAt: true,
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const customRevenues = await prisma.gymRevenue.findMany({
      orderBy: { date: "desc" }
    });

    const totalMembershipIncome = membershipRevenues.reduce((acc, r) => acc + (r.amountPaid || 0), 0);
    const totalCustomIncome = customRevenues.reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalRevenue = totalMembershipIncome + totalCustomIncome;

    // 2. Expenses
    const generalExpenses = await prisma.expense.findMany({ orderBy: { date: "desc" } });
    
    // Filter out any legacy/auto-generated Rent/Electricity records from the general expense pool
    const otherExpenses = generalExpenses.filter(
      (e) => e.category !== "Rent" && e.category !== "Electricity"
    );

    const rentPayments = await prisma.rentPayment.findMany({ orderBy: { createdAt: "desc" } });
    const electricityBills = await prisma.electricityBill.findMany({ orderBy: { createdAt: "desc" } });
    const salaryExpenses = await prisma.staffSalary.findMany({
      where: { paymentStatus: "Paid" },
      include: { staff: { select: { name: true, designation: true } } },
      orderBy: { createdAt: "desc" }
    });
    const incentiveExpenses = await prisma.incentive.findMany({
      where: { paymentStatus: "Paid" },
      include: { staff: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    });

    const totalOtherExpenses = otherExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const totalRentPaid = rentPayments.reduce((acc, r) => acc + (r.amountPaid || 0), 0);
    const totalElectricityPaid = electricityBills.filter((b) => b.paymentStatus === "Paid").reduce((acc, b) => acc + (b.billAmount || 0), 0);
    const totalSalariesPaid = salaryExpenses.reduce((acc, s) => acc + (s.totalPayable || 0), 0);
    const totalIncentivesPaid = incentiveExpenses.reduce((acc, i) => acc + (i.amount || 0), 0);

    const totalExpenses = totalRentPaid + totalElectricityPaid + totalSalariesPaid + totalIncentivesPaid + totalOtherExpenses;
    const netProfit = totalRevenue - totalExpenses;

    // Categorized Expense Breakdown
    const expenseBreakdown = {
      Rent: totalRentPaid,
      Electricity: totalElectricityPaid,
      Salaries: totalSalariesPaid,
      Incentives: totalIncentivesPaid,
      Other: totalOtherExpenses,
    };

    return apiResponse({
      summary: {
        totalRevenue,
        totalMembershipIncome,
        totalCustomIncome,
        totalExpenses,
        totalOtherExpenses,
        netProfit,
        profitMargin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0,
      },
      expenseBreakdown,
      membershipRevenues,
      customRevenues,
      generalExpenses,
      otherExpenses,
      rentPayments,
      electricityBills,
      salaryExpenses,
      incentiveExpenses,
    });
  } catch (error) {
    console.error("[OWNER_FINANCE_GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();
    const { action } = body;

    // Action 1: Add Other Expense
    if (action === "add-expense") {
      const parse = CreateExpenseSchema.safeParse(body);
      if (!parse.success) return apiError("Invalid expense data", 400);

      const expData = parse.data;
      const expense = await prisma.expense.create({
        data: {
          category: expData.category || "Other",
          amount: expData.amount,
          date: expData.date ? new Date(expData.date) : new Date(),
          month: expData.month,
          year: expData.year,
          paymentStatus: expData.paymentStatus,
          paymentMode: expData.paymentMode,
          description: expData.description,
          receiptUrl: expData.receiptUrl,
          notes: expData.notes,
        }
      });

      await prisma.auditLog.create({
        data: {
          action: "EXPENSE_ADDED",
          performedByUserId: Number(session.sub),
          performedByName: session.name || session.email,
          role: "OWNER",
          targetRecordId: String(expense.id),
          targetRecordType: "EXPENSE",
          description: `Owner added ${expData.category} expense of ₹${expData.amount} (${expData.description}).`,
        }
      }).catch(() => {});

      return apiResponse({ message: "Other expense created successfully.", expense });
    }

    // Action 1b: Edit Other Expense
    if (action === "edit-expense") {
      const parse = UpdateExpenseSchema.safeParse(body);
      if (!parse.success) return apiError("Invalid update data", 400);

      const { id, ...dataToUpdate } = parse.data;
      const existing = await prisma.expense.findUnique({ where: { id } });
      if (!existing) return apiError("Expense record not found", 404);

      const updated = await prisma.expense.update({
        where: { id },
        data: {
          ...dataToUpdate,
          date: dataToUpdate.date ? new Date(dataToUpdate.date) : existing.date,
        }
      });

      return apiResponse({ message: "Expense record updated.", expense: updated });
    }

    // Action 1c: Delete Expense
    if (action === "delete-expense") {
      const id = Number(body.id);
      if (!id) return apiError("Expense ID required", 400);

      await prisma.expense.delete({ where: { id } });

      await prisma.auditLog.create({
        data: {
          action: "EXPENSE_DELETED",
          performedByUserId: Number(session.sub),
          performedByName: session.name || session.email,
          role: "OWNER",
          targetRecordId: String(id),
          targetRecordType: "EXPENSE",
          description: `Owner deleted expense record #${id}.`,
        }
      }).catch(() => {});

      return apiResponse({ message: "Expense record deleted successfully." });
    }

    // Action 2: Add Custom Revenue
    if (action === "add-revenue") {
      const parse = CreateRevenueSchema.safeParse(body);
      if (!parse.success) return apiError("Invalid revenue data", 400);

      const revData = parse.data;
      const revenue = await prisma.gymRevenue.create({
        data: {
          category: revData.category,
          amount: revData.amount,
          source: revData.source || "Direct",
          date: revData.date ? new Date(revData.date) : new Date(),
          month: revData.month,
          year: revData.year,
          paymentMode: revData.paymentMode,
          referenceId: revData.referenceId,
          notes: revData.notes,
        }
      });

      return apiResponse({ message: "Revenue entry created.", revenue });
    }

    // Action 3: Record Rent Payment
    if (action === "record-rent") {
      const parse = CreateRentSchema.safeParse(body);
      if (!parse.success) return apiError("Invalid rent data", 400);

      const rentData = parse.data;
      const pendingAmount = Math.max(0, rentData.monthlyRent - rentData.amountPaid);
      const rent = await prisma.rentPayment.create({
        data: {
          month: rentData.month,
          year: rentData.year,
          monthlyRent: rentData.monthlyRent,
          landlordInfo: rentData.landlordInfo,
          dueDate: new Date(rentData.dueDate),
          paymentDate: rentData.paymentDate ? new Date(rentData.paymentDate) : (rentData.paymentStatus === "Paid" ? new Date() : null),
          paymentStatus: rentData.paymentStatus,
          amountPaid: rentData.amountPaid,
          pendingAmount,
          paymentMethod: rentData.paymentMethod,
          notes: rentData.notes,
        }
      });

      return apiResponse({ message: "Rent payment recorded.", rent });
    }

    // Action 4: Record Electricity Bill
    if (action === "record-electricity") {
      const parse = CreateElectricitySchema.safeParse(body);
      if (!parse.success) return apiError("Invalid electricity data", 400);

      const elecData = parse.data;
      const electricity = await prisma.electricityBill.create({
        data: {
          month: elecData.month,
          year: elecData.year,
          billAmount: elecData.billAmount,
          dueDate: new Date(elecData.dueDate),
          paymentDate: elecData.paymentDate ? new Date(elecData.paymentDate) : (elecData.paymentStatus === "Paid" ? new Date() : null),
          paymentStatus: elecData.paymentStatus,
          meterReading: elecData.meterReading,
          provider: elecData.provider,
          billNumber: elecData.billNumber,
          notes: elecData.notes,
        }
      });

      return apiResponse({ message: "Electricity bill recorded.", electricity });
    }

    // Action 5: Delete Rent Payment
    if (action === "delete-rent") {
      const id = Number(body.id);
      if (!id) return apiError("Rent ID required", 400);
      await prisma.rentPayment.delete({ where: { id } });
      return apiResponse({ message: "Rent record deleted." });
    }

    // Action 6: Delete Electricity Bill
    if (action === "delete-electricity") {
      const id = Number(body.id);
      if (!id) return apiError("Electricity ID required", 400);
      await prisma.electricityBill.delete({ where: { id } });
      return apiResponse({ message: "Electricity record deleted." });
    }

    return apiError("Invalid action", 400);
  } catch (error) {
    console.error("[OWNER_FINANCE_POST]", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireOwner();
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    const type = searchParams.get("type"); // 'expense' | 'rent' | 'electricity'

    if (!id) return apiError("ID required", 400);

    if (type === "rent") {
      await prisma.rentPayment.delete({ where: { id } });
    } else if (type === "electricity") {
      await prisma.electricityBill.delete({ where: { id } });
    } else {
      await prisma.expense.delete({ where: { id } });
    }

    return apiResponse({ message: "Record deleted successfully." });
  } catch (error) {
    console.error("[OWNER_FINANCE_DELETE]", error);
    return apiError("Internal server error", 500);
  }
}
