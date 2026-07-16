import { prisma } from '@/lib/prisma';
import { requireAdmin, apiError, apiResponse } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
export const runtime = "nodejs";

const PatchUserSchema = z.object({
  userId: z.number(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});

const DeleteUserSchema = z.object({
  userId: z.number(),
});

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return apiResponse(users);
  } catch {
    return apiError("Unauthorized", 403);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const parse = PatchUserSchema.safeParse(body);
    
    if (!parse.success) {
      return apiError("Invalid input parameters: " + parse.error.issues.map(i => i.message).join(", "), 400);
    }
    
    const { userId, name, email, password, isActive, isAdmin } = parse.data;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return apiError("User not found", 404);

    // Protection: Admin cannot deactivate or demote themselves
    if (userId === Number(session.sub)) {
      if (isActive === false || isAdmin === false) {
        return apiError('Permission denied: You cannot deactivate or demote your own account.', 400);
      }
    }

    // Prepare update data
    const updateData: Record<string, string | boolean | undefined> = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    
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
      select: { id: true, name: true, email: true, isAdmin: true, isActive: true },
    });

    return apiResponse({ message: 'User updated.', user: updated });
  } catch (error) {
    console.error('[ADMIN_USER_PATCH]', error);
    return apiError("Failed to update user", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const parse = DeleteUserSchema.safeParse(body);
    
    if (!parse.success) return apiError("Invalid user ID", 400);
    const { userId } = parse.data;

    if (userId === Number(session.sub)) {
      return apiError('Permission denied: You cannot delete your own account.', 400);
    }

    await prisma.user.delete({ where: { id: userId } });
    return apiResponse({ message: 'User deleted.' });
  } catch (error) {
    console.error('[ADMIN_USER_DELETE]', error);
    return apiError("Failed to delete user", 500);
  }
}
