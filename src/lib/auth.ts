import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { env } from './env';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import "server-only";

const COOKIE_NAME = 'auth_token';

export interface AuthPayload {
  sub: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  isOwner?: boolean;
  role?: string;
  sessionId: string;
}

/**
 * Get the current session user from the secure httpOnly cookie.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const authPayload = payload as unknown as AuthPayload;

    if (!authPayload.sub || !authPayload.sessionId) {
      return null;
    }

    // Verify sessionId against the database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(authPayload.sub) },
      select: { currentSessionId: true, isActive: true, isAdmin: true, isOwner: true, role: true },
    });

    if (!user || !user.isActive || user.currentSessionId !== authPayload.sessionId) {
      return null;
    }

    return {
      ...authPayload,
      isAdmin: user.isAdmin || user.isOwner,
      isOwner: user.isOwner,
      role: user.role,
    };
  } catch {
    return null;
  }
}

/**
 * Ensures the requester is an admin or owner.
 * Use this in server actions or API routes.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || (!session.isAdmin && !session.isOwner)) {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

/**
 * Ensures the requester has Owner level access.
 * Use this for owner-only actions.
 */
export async function requireOwner() {
  const session = await getSession();
  if (!session || !session.isOwner) {
    throw new Error("Unauthorized: Owner permission required");
  }
  return session;
}

import { ALL_PERMISSIONS, PermissionKey } from './permissions';
export { ALL_PERMISSIONS, type PermissionKey };

/**
 * Fetch all active permission keys for a given user.
 * Owners implicitly have ALL permissions.
 */
export async function getAdminPermissions(userId: number): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isOwner: true, isAdmin: true },
  });

  if (!user) return [];
  if (user.isOwner) return [...ALL_PERMISSIONS];

  const perms = await prisma.adminPermission.findMany({
    where: { userId },
    select: { permission: true },
  });

  return perms.map((p) => p.permission);
}

/**
 * Checks if a user has a specific permission.
 * Owners have all permissions automatically.
 */
export async function hasPermission(userId: number, permission: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isOwner: true, isAdmin: true },
  });

  if (!user || (!user.isAdmin && !user.isOwner)) return false;
  if (user.isOwner) return true;

  const count = await prisma.adminPermission.count({
    where: { userId, permission },
  });

  return count > 0;
}

/**
 * Ensures the requester has a specific permission or is an Owner.
 * Throws an error if unauthorized.
 */
export async function requirePermission(permissionKey: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: Authentication required");
  }

  if (session.isOwner) {
    return session;
  }

  const allowed = await hasPermission(parseInt(session.sub, 10), permissionKey);
  if (!allowed) {
    throw new Error(`Unauthorized: Missing required permission (${permissionKey})`);
  }

  return session;
}

/**
 * Standardized API success/error responder
 */
export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Reusable Prisma filter condition to exclude Owner accounts.
 */
export const NON_OWNER_USER_FILTER = {
  isOwner: false,
  role: { notIn: ["OWNER", "Owner", "owner"] },
};

/**
 * Reusable Prisma filter condition to exclude Owner and Admin accounts (only regular members).
 */
export const NON_ADMIN_MEMBER_FILTER = {
  isOwner: false,
  isAdmin: false,
  role: { notIn: ["OWNER", "Owner", "owner", "ADMIN", "Admin", "admin"] },
};

/**
 * Checks whether a given user object represents an Owner account.
 */
export function isOwnerUser(user?: { isOwner?: boolean; role?: string | null } | null): boolean {
  if (!user) return false;
  return !!user.isOwner || (user.role ? user.role.toUpperCase() === "OWNER" : false);
}

/**
 * Checks whether a given user object represents an Admin or Owner account.
 */
export function isAdminOrOwnerUser(user?: { isOwner?: boolean; isAdmin?: boolean; role?: string | null } | null): boolean {
  if (!user) return false;
  if (isOwnerUser(user)) return true;
  return !!user.isAdmin || (user.role ? user.role.toUpperCase() === "ADMIN" : false);
}



