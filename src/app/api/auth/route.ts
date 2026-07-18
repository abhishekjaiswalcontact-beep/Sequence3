import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import {
  apiError,
  apiResponse,
  requireAdmin,
} from "@/lib/auth";

export const runtime = "nodejs";

const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const LoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
  isAdmin: z.boolean().optional(),
});

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "12345678";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // ==========================
    // LOGIN
    // ==========================

    // ==========================
// LOGIN
// ==========================

if (action === "login") {
  const parse = LoginSchema.safeParse(body);

  if (!parse.success) {
    return apiError("Invalid input.", 400);
  }

  const { email, password } = parse.data;

  // -----------------------
  // Hardcoded Admin Login
  // -----------------------

  if (
    email === ADMIN_EMAIL &&
    password === ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      {
        sub: "1",
        email: ADMIN_EMAIL,
        name: "Admin",
        isAdmin: true,
      },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const response = apiResponse({
      message: "Login successful.",
      user: {
        id: 1,
        email: ADMIN_EMAIL,
        name: "Admin",
        isAdmin: true,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  }

  // -----------------------
  // Database User Login
  // -----------------------

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return apiError("Invalid credentials.", 401);
  }

  if (!user.isActive) {
    return apiError("Account disabled.", 403);
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    return apiError("Invalid credentials.", 401);
  }

  const token = jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  const response = apiResponse({
    message: "Login successful.",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
  });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}

    // ==========================
    // CREATE USER
    // ==========================

    if (action === "create-user") {
      await requireAdmin();

      const parse = CreateUserSchema.safeParse(body);

      if (!parse.success) {
        return apiError("Invalid user data.", 400);
      }

      const { name, email, password, isAdmin } = parse.data;

      const existing = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existing) {
        return apiError("Email already exists.", 409);
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          isAdmin: isAdmin ?? false,
          isActive: true,
        },
      });

      return apiResponse({
        message: "User created successfully.",
        user,
      });
    }

    // ==========================
    // LOGOUT
    // ==========================

    if (action === "logout") {
      const response = apiResponse({
        message: "Logged out.",
      });

      response.cookies.set(COOKIE_NAME, "", {
        maxAge: 0,
        path: "/",
      });

      return response;
    }

    return apiError("Invalid action.", 400);
  } catch (error) {
    console.error("[AUTH_API_ERROR]", error);

    return apiError(
      error instanceof Error
        ? error.message
        : "Internal Server Error",
      500
    );
  }
}