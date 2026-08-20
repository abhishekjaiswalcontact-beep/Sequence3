import { prisma } from '@/lib/prisma';
import { requireOwner, requirePermission, apiError, apiResponse, NON_ADMIN_MEMBER_FILTER, isOwnerUser, isAdminOrOwnerUser } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
export const runtime = "nodejs";

const PatchUserSchema = z.object({
  userId: z.number(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
  role: z.string().optional(),
});

const DeleteUserSchema = z.object({
  userId: z.number(),
});

export async function GET() {
  try {
    const session = await requirePermission("VIEW_MEMBERS");
    // Admins only view regular members; Owners can view all non-owner members
    const filter = session.isOwner ? { isOwner: false } : NON_ADMIN_MEMBER_FILTER;
    const users = await prisma.user.findMany({
      where: filter,
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
        memberships: {
          select: {
            id: true,
            membershipId: true,
            plan: true,
            status: true,
            endDate: true,
          },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return apiResponse(users);
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return apiError("Unauthorized", 403);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requirePermission("EDIT_MEMBER");
    const body = await req.json();
    const parse = PatchUserSchema.safeParse(body);
    
    if (!parse.success) {
      return apiError("Invalid input parameters: " + parse.error.issues.map(i => i.message).join(", "), 400);
    }
    
    const { userId, name, email, password, phone, isActive, isAdmin, role } = parse.data;

    // SECURITY ENFORCEMENT: Reject any attempt by non-owner to assign Admin role or toggle isAdmin
    if ((isAdmin !== undefined || role !== undefined) && !session.isOwner) {
      return apiError("Permission denied: Only the Owner can grant or revoke Admin privileges or assign roles.", 403);
    }

    // SECURITY ENFORCEMENT: Absolutely block any attempt to set isOwner via this API — no exceptions.
    if ((body as { isOwner?: unknown }).isOwner !== undefined) {
      return apiError("Permission denied: The Owner role cannot be assigned via API.", 403);
    }

    // Check target user
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return apiError("User not found", 404);

    if (isOwnerUser(targetUser)) {
      return apiError("Access denied: Cannot modify Owner accounts.", 403);
    }

    // SECURITY ENFORCEMENT: Admins cannot edit, deactivate, or modify another Admin's account
    if (!session.isOwner && isAdminOrOwnerUser(targetUser)) {
      return apiError("Permission denied: Admins cannot modify Admin accounts. Only the Owner has access to Admin management.", 403);
    }

    // Protection: Admin cannot deactivate, demote, or change their own password from this panel
    if (userId === Number(session.sub)) {
      if (isActive === false || isAdmin === false) {
        return apiError('Permission denied: You cannot deactivate or demote your own account.', 400);
      }
      if (password !== undefined) {
        return apiError('Permission denied: Admins cannot change their own password from the member panel.', 403);
      }
    }

    // Prepare update data
    const updateData: Record<string, string | boolean | undefined> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Only Owner can modify isAdmin or role
    if (session.isOwner) {
      if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
      if (role !== undefined) updateData.role = role;
    }
    
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return apiError("Email already in use by another account", 409);
      }
      updateData.email = email;
    }

    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, isAdmin: true, isOwner: true, role: true, isActive: true },
    });

    return apiResponse({ message: 'User updated.', user: updated });
  } catch (error) {
    console.error('[ADMIN_USER_PATCH]', error);
    return apiError("Failed to update user", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    let session;
    try {
      session = await requireOwner();
    } catch {
      return apiError("Permission denied: Only the Owner has permission to delete accounts.", 403);
    }

    const body = await req.json();
    const parse = DeleteUserSchema.safeParse(body);
    
    if (!parse.success) return apiError("Invalid user ID", 400);
    const { userId } = parse.data;

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser || isOwnerUser(targetUser)) {
      return apiError("Permission denied: Cannot delete Owner account.", 403);
    }

    if (userId === Number(session.sub)) {
      return apiError('Permission denied: You cannot delete your own account.', 400);
    }

    await prisma.user.delete({ where: { id: userId } });

    // Log audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_DELETED',
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: 'OWNER',
        targetRecordId: String(userId),
        targetRecordType: 'USER',
        description: `Owner permanently deleted user ID ${userId}`,
      }
    }).catch(() => {});

    return apiResponse({ message: 'User deleted.' });
  } catch (error) {
    console.error('[ADMIN_USER_DELETE]', error);
    return apiError("Failed to delete user", 500);
  }
}


