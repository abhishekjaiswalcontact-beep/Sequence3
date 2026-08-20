import { requireOwner, apiResponse, apiError, ALL_PERMISSIONS } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const runtime = "nodejs";

const CreateAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
  phone: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

const UpdateAdminSchema = z.object({
  userId: z.number(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    await requireOwner();

    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { isAdmin: true },
          { role: "ADMIN" },
        ],
        isOwner: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isAdmin: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        adminPermissions: {
          select: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedAdmins = admins.map((admin) => ({
      ...admin,
      permissions: admin.adminPermissions.map((p) => p.permission),
    }));

    return apiResponse(formattedAdmins);
  } catch (error) {
    console.error("[OWNER_ADMINS_GET]", error);
    return apiError(error instanceof Error ? error.message : "Failed to fetch admins", 400);
  }
}

export async function POST(req: Request) {
  try {
    const ownerSession = await requireOwner();
    const body = await req.json();
    const parse = CreateAdminSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid data provided", 400);
    }

    const { name, email, password, phone, permissions } = parse.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("A user with this email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || "",
        isAdmin: true,
        isOwner: false,
        role: "ADMIN",
        isActive: true,
      },
    });

    // Create staff record if not existing
    await prisma.staff.create({
      data: {
        userId: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        designation: "Gym Administrator",
        department: "Management",
        monthlySalary: 0,
      },
    }).catch(() => {});

    // Set permissions if provided
    const validPermissions = (permissions || []).filter((p) =>
      (ALL_PERMISSIONS as readonly string[]).includes(p)
    );

    if (validPermissions.length > 0) {
      await prisma.adminPermission.createMany({
        data: validPermissions.map((p) => ({
          userId: newAdmin.id,
          permission: p,
        })),
      });
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        action: "ADMIN_CREATED",
        performedByUserId: parseInt(ownerSession.sub, 10),
        performedByName: ownerSession.name || "Owner",
        role: "OWNER",
        targetRecordId: String(newAdmin.id),
        targetRecordType: "User",
        description: `Created Admin user: ${newAdmin.name} (${newAdmin.email}) with ${validPermissions.length} permissions.`,
      },
    });

    return apiResponse({ message: "Admin created successfully", admin: newAdmin }, 201);
  } catch (error) {
    console.error("[OWNER_ADMINS_POST]", error);
    return apiError(error instanceof Error ? error.message : "Failed to create admin", 400);
  }
}

export async function PATCH(req: Request) {
  try {
    const ownerSession = await requireOwner();
    const body = await req.json();
    const parse = UpdateAdminSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid data provided", 400);
    }

    const { userId, name, email, password, phone, isActive, permissions } = parse.data;

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return apiError("Admin user not found", 404);
    if (targetUser.isOwner) return apiError("Cannot modify Owner privileges via Admin API", 403);

    // SECURITY ENFORCEMENT: Absolutely block any attempt to set isOwner via this API.
    if ((body as { isOwner?: unknown }).isOwner !== undefined) {
      return apiError("Permission denied: The Owner role cannot be assigned via API.", 403);
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (email !== undefined) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        return apiError("Email already in use by another user", 400);
      }
      updateData.email = email;
    }
    if (password && password.trim().length >= 8) {
      updateData.password = await bcrypt.hash(password.trim(), 12);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Update permissions matrix if supplied
    if (permissions !== undefined) {
      const validPermissions = permissions.filter((p) =>
        (ALL_PERMISSIONS as readonly string[]).includes(p)
      );

      // Remove existing permissions and insert new ones
      await prisma.adminPermission.deleteMany({ where: { userId } });
      if (validPermissions.length > 0) {
        await prisma.adminPermission.createMany({
          data: validPermissions.map((p) => ({
            userId,
            permission: p,
          })),
        });
      }
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        action: "ADMIN_UPDATED",
        performedByUserId: parseInt(ownerSession.sub, 10),
        performedByName: ownerSession.name || "Owner",
        role: "OWNER",
        targetRecordId: String(userId),
        targetRecordType: "User",
        description: `Updated Admin user permissions/details for ${updated.name}`,
      },
    });

    return apiResponse({ message: "Admin user updated successfully", admin: updated });
  } catch (error) {
    console.error("[OWNER_ADMINS_PATCH]", error);
    return apiError(error instanceof Error ? error.message : "Failed to update admin", 400);
  }
}

export async function DELETE(req: Request) {
  try {
    const ownerSession = await requireOwner();
    const { userId } = await req.json();

    if (!userId || typeof userId !== "number") {
      return apiError("Invalid Admin ID", 400);
    }

    if (userId === parseInt(ownerSession.sub, 10)) {
      return apiError("Owner cannot delete their own account", 400);
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return apiError("Admin user not found", 404);
    if (targetUser.isOwner) return apiError("Cannot delete Owner user", 403);

    await prisma.user.delete({ where: { id: userId } });

    await prisma.auditLog.create({
      data: {
        action: "ADMIN_DELETED",
        performedByUserId: parseInt(ownerSession.sub, 10),
        performedByName: ownerSession.name || "Owner",
        role: "OWNER",
        targetRecordId: String(userId),
        targetRecordType: "User",
        description: `Permanently deleted Admin: ${targetUser.name} (${targetUser.email})`,
      },
    });

    return apiResponse({ message: "Admin permanently deleted" });
  } catch (error) {
    console.error("[OWNER_ADMINS_DELETE]", error);
    return apiError(error instanceof Error ? error.message : "Failed to delete admin", 400);
  }
}
