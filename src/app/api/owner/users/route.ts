import { prisma } from "@/lib/prisma";
import { requireOwner, apiError, apiResponse } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(["OWNER", "ADMIN", "TRAINER", "STAFF", "MEMBER"]).optional().default("MEMBER"),
  designation: z.string().optional(),
  department: z.string().optional(),
  monthlySalary: z.number().optional(),
});

const UpdateUserSchema = z.object({
  userId: z.number(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  role: z.enum(["OWNER", "ADMIN", "TRAINER", "STAFF", "MEMBER"]).optional(),
  isActive: z.boolean().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  monthlySalary: z.number().optional(),
});

const DeleteUserSchema = z.object({
  userId: z.number(),
});

export async function GET(req: Request) {
  try {
    await requireOwner();

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role") || "";
    const search = searchParams.get("search") || "";

    const whereConditions: Record<string, unknown>[] = [];

    if (roleFilter) {
      if (roleFilter === "OWNER") whereConditions.push({ isOwner: true });
      else if (roleFilter === "ADMIN") whereConditions.push({ isAdmin: true });
      else whereConditions.push({ role: roleFilter });
    }

    if (search) {
      whereConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ]
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isAdmin: true,
        isOwner: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        memberships: {
          orderBy: { startDate: "desc" },
          take: 1,
        },
        staff: {
          select: {
            id: true,
            designation: true,
            department: true,
            monthlySalary: true,
            employmentStatus: true,
          }
        },
        assignedAsClient: {
          select: {
            id: true,
            trainer: {
              select: { name: true }
            }
          },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse(users);
  } catch (error) {
    console.error("[OWNER_USERS_GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();
    const parse = CreateUserSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid input: " + parse.error.issues.map(i => i.message).join(", "), 400);
    }

    const { name, email, password, phone, role, designation, department, monthlySalary } = parse.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return apiError("Email already in use.", 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const isOwner = role === "OWNER";
    const isAdmin = role === "ADMIN" || isOwner;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || "",
        isAdmin,
        isOwner,
        role,
        isActive: true,
      }
    });

    // If role is STAFF, TRAINER, ADMIN, or OWNER, also create Staff entry
    if (["OWNER", "ADMIN", "TRAINER", "STAFF"].includes(role)) {
      await prisma.staff.create({
        data: {
          userId: newUser.id,
          name,
          email,
          phone: phone || "",
          designation: designation || (role === "TRAINER" ? "Personal Trainer" : role === "ADMIN" ? "Admin" : role === "OWNER" ? "Owner" : "Staff Member"),
          department: department || (role === "TRAINER" ? "Fitness" : "Management"),
          monthlySalary: monthlySalary || 0,
        }
      }).catch(() => {});
    }

    // Log Audit Event
    await prisma.auditLog.create({
      data: {
        action: "USER_ADDED",
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: "OWNER",
        targetRecordId: String(newUser.id),
        targetRecordType: "USER",
        description: `Owner created new user "${name}" with role ${role}.`,
      }
    }).catch(() => {});

    return apiResponse({ message: "User created successfully.", user: newUser });
  } catch (error) {
    console.error("[OWNER_USERS_POST]", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();
    const parse = UpdateUserSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid input: " + parse.error.issues.map(i => i.message).join(", "), 400);
    }

    const { userId, name, email, password, phone, role, isActive, designation, department, monthlySalary } = parse.data;

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return apiError("User not found", 404);

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (role !== undefined) {
      updateData.role = role;
      updateData.isOwner = role === "OWNER";
      updateData.isAdmin = role === "ADMIN" || role === "OWNER";
    }

    if (email !== undefined) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        return apiError("Email already taken by another account", 409);
      }
      updateData.email = email;
    }

    if (password !== undefined && password.trim().length >= 8) {
      updateData.password = await bcrypt.hash(password.trim(), 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Update associated staff record if exists or needed
    const staffRecord = await prisma.staff.findUnique({ where: { userId } }).catch(() => null);
    if (staffRecord || (role && ["OWNER", "ADMIN", "TRAINER", "STAFF"].includes(role))) {
      await prisma.staff.upsert({
        where: { userId },
        update: {
          ...(name ? { name } : {}),
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(designation ? { designation } : {}),
          ...(department ? { department } : {}),
          ...(monthlySalary !== undefined ? { monthlySalary } : {}),
        },
        create: {
          userId,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone || "",
          designation: designation || (role === "TRAINER" ? "Personal Trainer" : "Staff Member"),
          department: department || "Operations",
          monthlySalary: monthlySalary || 0,
        }
      }).catch(() => {});
    }

    // Log Audit Event
    await prisma.auditLog.create({
      data: {
        action: "USER_EDITED",
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: "OWNER",
        targetRecordId: String(userId),
        targetRecordType: "USER",
        description: `Owner updated user "${updatedUser.name}".`,
      }
    }).catch(() => {});

    return apiResponse({ message: "User updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("[OWNER_USERS_PATCH]", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();
    const parse = DeleteUserSchema.safeParse(body);

    if (!parse.success) return apiError("Invalid user ID", 400);
    const { userId } = parse.data;

    if (userId === Number(session.sub)) {
      return apiError("Permission denied: You cannot delete your own account.", 400);
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!userToDelete) return apiError("User not found", 404);

    await prisma.user.delete({ where: { id: userId } });

    // Log Audit Event
    await prisma.auditLog.create({
      data: {
        action: "USER_DELETED",
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: "OWNER",
        targetRecordId: String(userId),
        targetRecordType: "USER",
        description: `Owner permanently deleted user "${userToDelete.name}" (${userToDelete.email}).`,
      }
    }).catch(() => {});

    return apiResponse({ message: `User "${userToDelete.name}" deleted successfully.` });
  } catch (error) {
    console.error("[OWNER_USERS_DELETE]", error);
    return apiError("Internal server error", 500);
  }
}
