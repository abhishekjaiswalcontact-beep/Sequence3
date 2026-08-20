import { prisma } from "@/lib/prisma";
import { requireOwner, apiError, apiResponse } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";

const CreateStaffSchema = z.object({
  userId: z.number().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  designation: z.string(),
  department: z.string(),
  monthlySalary: z.number().default(0),
  workingHours: z.string().optional(),
  notes: z.string().optional(),
});

const UpdateStaffSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  monthlySalary: z.number().optional(),
  employmentStatus: z.string().optional(),
  workingHours: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    await requireOwner();

    const staffMembers = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true,
          }
        },
        salaries: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        incentives: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        trainerClients: {
          include: {
            client: {
              select: { name: true, email: true, phone: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedStaff = staffMembers.map((s) => {
      const activeClients = s.trainerClients.filter(c => c.status === "Active").length;
      const completedClients = s.trainerClients.filter(c => c.status === "Completed").length;
      const totalIncentiveEarned = s.incentives.reduce((acc, i) => acc + i.amount, 0);
      const pendingIncentive = s.incentives.filter(i => i.paymentStatus === "Pending").reduce((acc, i) => acc + i.amount, 0);
      const paidIncentive = s.incentives.filter(i => i.paymentStatus === "Paid").reduce((acc, i) => acc + i.amount, 0);

      return {
        id: s.id,
        userId: s.userId,
        name: s.name,
        email: s.email,
        phone: s.phone,
        photo: s.photo,
        designation: s.designation,
        department: s.department,
        joiningDate: s.joiningDate,
        employmentStatus: s.employmentStatus,
        monthlySalary: s.monthlySalary,
        workingHours: s.workingHours,
        notes: s.notes,
        assignedClientsCount: s.trainerClients.length,
        activeClientsCount: activeClients,
        completedClientsCount: completedClients,
        totalIncentiveEarned,
        pendingIncentive,
        paidIncentive,
        recentSalaries: s.salaries,
        recentIncentives: s.incentives,
        trainerClients: s.trainerClients,
      };
    });

    return apiResponse(formattedStaff);
  } catch (error) {
    console.error("[OWNER_STAFF_GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();
    const parse = CreateStaffSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid input: " + parse.error.issues.map(i => i.message).join(", "), 400);
    }

    const { userId, name, email, phone, designation, department, monthlySalary, workingHours, notes } = parse.data;

    const staff = await prisma.staff.create({
      data: {
        userId,
        name,
        email,
        phone: phone || "",
        designation,
        department,
        monthlySalary,
        workingHours: workingHours || "9:00 AM - 6:00 PM",
        notes,
      }
    });

    // Log Audit Event
    await prisma.auditLog.create({
      data: {
        action: "STAFF_ADDED",
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: "OWNER",
        targetRecordId: String(staff.id),
        targetRecordType: "STAFF",
        description: `Owner added staff member "${name}" (${designation}).`,
      }
    }).catch(() => {});

    return apiResponse({ message: "Staff member added successfully.", staff });
  } catch (error) {
    console.error("[OWNER_STAFF_POST]", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();
    const parse = UpdateStaffSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid input: " + parse.error.issues.map(i => i.message).join(", "), 400);
    }

    const { id, name, email, phone, designation, department, monthlySalary, employmentStatus, workingHours, notes } = parse.data;

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        ...(designation ? { designation } : {}),
        ...(department ? { department } : {}),
        ...(monthlySalary !== undefined ? { monthlySalary } : {}),
        ...(employmentStatus ? { employmentStatus } : {}),
        ...(workingHours ? { workingHours } : {}),
        ...(notes !== undefined ? { notes } : {}),
      }
    });

    // Log Audit Event
    await prisma.auditLog.create({
      data: {
        action: "STAFF_EDITED",
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: "OWNER",
        targetRecordId: String(id),
        targetRecordType: "STAFF",
        description: `Owner updated staff details for "${updatedStaff.name}".`,
      }
    }).catch(() => {});

    return apiResponse({ message: "Staff details updated successfully.", staff: updatedStaff });
  } catch (error) {
    console.error("[OWNER_STAFF_PATCH]", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "number") return apiError("Invalid staff ID", 400);

    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) return apiError("Staff record not found", 404);

    await prisma.staff.delete({ where: { id } });

    // Log Audit Event
    await prisma.auditLog.create({
      data: {
        action: "STAFF_REMOVED",
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: "OWNER",
        targetRecordId: String(id),
        targetRecordType: "STAFF",
        description: `Owner deleted staff record for "${staff.name}".`,
      }
    }).catch(() => {});

    return apiResponse({ message: `Staff member "${staff.name}" removed successfully.` });
  } catch (error) {
    console.error("[OWNER_STAFF_DELETE]", error);
    return apiError("Internal server error", 500);
  }
}
