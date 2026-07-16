import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { env } from './env';
import { NextResponse } from 'next/server';
import "server-only";

const COOKIE_NAME = 'auth_token';

export interface AuthPayload {
  sub: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
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
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

/**
 * Ensures the requester is an admin.
 * Use this in server actions or API routes.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    throw new Error("Unauthorized: Admin access required");
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
