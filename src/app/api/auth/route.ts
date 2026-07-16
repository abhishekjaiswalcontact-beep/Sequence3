import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';
import { getSession, apiError, apiResponse } from '@/lib/auth';
import { z } from 'zod';
export const runtime = "nodejs";

const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Input Validation Schemas
const LoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

const CreateUserSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
  name: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    if (action === 'login') {
      const parse = LoginSchema.safeParse(body);
      if (!parse.success) {
        console.warn('[AUTH] Validation failed:', parse.error.format());
        return apiError("Invalid input format.", 400);
      }

      const { email, password } = parse.data;

      console.log(`[AUTH] Login attempt for: ${email}`);

      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        console.warn(`[AUTH] Login failed: User not found (${email})`);
        return apiError('Invalid credentials.', 401);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.warn(`[AUTH] Login failed: Password mismatch for ${email}`);
        // SECURITY TIP: If you see this but are SURE the password is correct, 
        // check if your password in DB is PLAIN TEXT. Bcrypt.compare only works with hashed passwords!
        return apiError('Invalid credentials.', 401);
      }

      if (!user.isActive) {
        console.warn(`[AUTH] Login failed: Account deactivated for ${email}`);
        return apiError('Your account has been deactivated. Please contact the administrator.', 403);
      }

      const token = jwt.sign(
        { sub: String(user.id), email: user.email, name: user.name, isAdmin: user.isAdmin },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = apiResponse({
        message: 'Login successful.',
        user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      return response;
    }

    // ── ADMIN: CREATE USER ────────────────────────────────────────────────────
    if (action === 'create-user') {
      const session = await getSession();
      if (!session?.isAdmin) return apiError('Unauthorized. Admin access required.', 403);

      const parse = CreateUserSchema.safeParse(body);
      if (!parse.success) return apiError("Invalid user data. Password must be at least 8 characters.", 400);

      const { email, password, name, isAdmin: makeAdmin } = parse.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return apiError('A user with this email already exists.', 409);

      const hashed = await bcrypt.hash(password, 12);
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashed,
          name: name || email.split('@')[0],
          isAdmin: !!makeAdmin,
          isActive: true,
        },
      });

      return apiResponse({
        message: 'User created successfully.',
        user: { id: newUser.id, email: newUser.email, name: newUser.name, isAdmin: newUser.isAdmin },
      });
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────────
    if (action === 'logout') {
      const response = apiResponse({ message: 'Logged out.' });
      response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
      return response;
    }

    return apiError('Invalid action.', 400);
  } catch (error: unknown) {
    console.error('[AUTH_API_ERROR]', error);
    return apiError('Internal server error.', 500);
  }
}
