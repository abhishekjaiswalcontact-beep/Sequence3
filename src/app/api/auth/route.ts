import jwt from "jsonwebtoken";
import { env } from "@/lib/env";
import { apiError, apiResponse } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";

const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 Days

const LoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "12345678";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // =========================
    // LOGIN
    // =========================
    if (action === "login") {
      const parse = LoginSchema.safeParse(body);

      if (!parse.success) {
        return apiError("Invalid input.", 400);
      }

      const { email, password } = parse.data;

      if (
        email !== ADMIN_EMAIL ||
        password !== ADMIN_PASSWORD
      ) {
        return apiError("Invalid credentials.", 401);
      }

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

    // =========================
    // LOGOUT
    // =========================
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
    console.error(error);
    return apiError("Internal server error.", 500);
  }
}