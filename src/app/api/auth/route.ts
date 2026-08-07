import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import {
  apiError,
  apiResponse,
  requireAdmin,
} from "@/lib/auth";
import { sendReferralNotifications } from "@/lib/referral";

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
  phone: z.string().optional(),
  isAdmin: z.boolean().optional(),
  referralCode: z.string().optional(),
  assignMembership: z.boolean().optional(),
  membershipPlan: z.string().optional(),
  membershipStartDate: z.string().optional(),
  membershipCustomEndDate: z.string().nullable().optional(),
  membershipTotalAmount: z.number().optional(),
  membershipDiscount: z.number().optional(),
  membershipAmountPaid: z.number().optional(),
  membershipPaymentMode: z.string().optional(),
  membershipStatus: z.string().optional(),
  membershipPTIncluded: z.boolean().optional(),
  membershipPTTrainerName: z.string().nullable().optional(),
  membershipPTStartDate: z.string().nullable().optional(),
  membershipPTEndDate: z.string().nullable().optional(),
  membershipNotes: z.string().nullable().optional(),
  membershipRemarks: z.string().nullable().optional(),
});

const ADMIN_EMAIL = "pinakaadmin@gmail.com";
const ADMIN_PASSWORD = "pinakaadmin127";

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
    const sessionId = crypto.randomUUID();
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const adminUser = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        currentSessionId: sessionId,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        lastLoginUA: userAgent,
        isAdmin: true,
        isActive: true,
      },
      create: {
        email: ADMIN_EMAIL,
        name: "Admin",
        password: await bcrypt.hash(ADMIN_PASSWORD, 12),
        isAdmin: true,
        isActive: true,
        currentSessionId: sessionId,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        lastLoginUA: userAgent,
      },
    });

    const token = jwt.sign(
      {
        sub: String(adminUser.id),
        email: ADMIN_EMAIL,
        name: "Admin",
        isAdmin: true,
        sessionId: sessionId,
      },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const response = apiResponse({
      message: "Login successful.",
      user: {
        id: adminUser.id,
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

  const sessionId = crypto.randomUUID();
  const userAgent = req.headers.get("user-agent") || "unknown";
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  await prisma.user.update({
    where: { id: user.id },
    data: {
      currentSessionId: sessionId,
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      lastLoginUA: userAgent,
    },
  });

  const token = jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      sessionId: sessionId,
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
        return apiError("Invalid user data: " + parse.error.issues.map(i => i.message).join(", "), 400);
      }

      const { name, email, password, phone, isAdmin, referralCode } = parse.data;

      const existing = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existing) {
        return apiError("Email already exists.", 409);
      }

      // If a referral code was passed, validate it first
      let referrerCodeObj = null;
      if (referralCode && referralCode.trim() !== "") {
        referrerCodeObj = await prisma.referralCode.findFirst({
          where: {
            code: referralCode.trim(),
            isActive: true,
          },
          include: {
            user: true,
          },
        });

        if (!referrerCodeObj) {
          return apiError("Invalid Referral Code", 400);
        }
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // Local helpers for date/status calculations
      const calculateMembershipDates = (plan: string, startDateStr: string, customEndDateStr?: string | null) => {
        const start = new Date(startDateStr);
        let end = new Date(start);

        if (plan === "Monthly") {
          end.setMonth(start.getMonth() + 1);
        } else if (plan === "Quarterly (3 Months)") {
          end.setMonth(start.getMonth() + 3);
        } else if (plan === "Half Yearly (6 Months)") {
          end.setMonth(start.getMonth() + 6);
        } else if (plan === "Yearly") {
          end.setFullYear(start.getFullYear() + 1);
        } else if (plan === "Custom" && customEndDateStr) {
          end = new Date(customEndDateStr);
        } else {
          end.setMonth(start.getMonth() + 1);
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const duration = `${durationDays} Days`;

        return {
          startDate: start,
          endDate: end,
          duration,
          renewalDate: end,
          expiryDate: end,
        };
      };

      const determineStatus = (startDate: Date, endDate: Date, currentStatus: string) => {
        if (currentStatus === "Frozen" || currentStatus === "Cancelled") {
          return currentStatus;
        }
        const now = new Date();
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (now > end) return "Expired";
        if (now < start) return "Upcoming";
        return "Active";
      };

      let referrerIdToNotify: number | null = null;
      let newUserId: number | null = null;

      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            phone: phone ?? "",
            isAdmin: isAdmin ?? false,
            isActive: true,
          },
        });

        newUserId = newUser.id;

        // Generate personal referral code for the new user
        let personalCode = "";
        let isCodeUnique = false;
        while (!isCodeUnique) {
          personalCode = "PINA-";
          const chars = "0123456789";
          for (let i = 0; i < 4; i++) {
            personalCode += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          const exists = await tx.referralCode.findUnique({ where: { code: personalCode } });
          if (!exists) isCodeUnique = true;
        }

        await tx.referralCode.create({
          data: {
            code: personalCode,
            userId: newUser.id,
          },
        });

        // If referred by someone, link them
        if (referrerCodeObj) {
          referrerIdToNotify = referrerCodeObj.userId;
          const referralStatus = parse.data.assignMembership && parse.data.membershipStatus === "Active"
            ? "Membership Activated"
            : "Joined";

          await tx.referral.create({
            data: {
              referrerId: referrerCodeObj.userId,
              referredId: newUser.id,
              codeUsed: referrerCodeObj.code,
              status: referralStatus,
              rewardStatus: "None",
            },
          });

          await tx.referralActivity.create({
            data: {
              userId: referrerCodeObj.userId,
              activityType: "REFERRAL_JOINED",
              details: `${newUser.name} registered using code ${referrerCodeObj.code}`,
            },
          });
        }

        if (parse.data.assignMembership && parse.data.membershipPlan) {
          const plan = parse.data.membershipPlan;
          const startDateStr = parse.data.membershipStartDate || new Date().toISOString();
          const customEndDateStr = parse.data.membershipCustomEndDate;

          const dateCalcs = calculateMembershipDates(plan, startDateStr, customEndDateStr);
          const status = determineStatus(dateCalcs.startDate, dateCalcs.endDate, parse.data.membershipStatus || "Active");

          const totalAmount = parse.data.membershipTotalAmount ?? 0;
          const discount = parse.data.membershipDiscount ?? 0;
          const amountPaid = parse.data.membershipAmountPaid ?? 0;
          const remainingBalance = Math.max(0, totalAmount - discount - amountPaid);
          const paymentStatus = remainingBalance === 0 ? "Paid" : amountPaid === 0 ? "Pending" : "Partial";

          // Generate a unique card ID
          let unique = false;
          let membershipId = "";
          while (!unique) {
            membershipId = "MEM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            const exists = await tx.membership.findUnique({ where: { membershipId } });
            if (!exists) unique = true;
          }

          await tx.membership.create({
            data: {
              membershipId,
              userId: newUser.id,
              plan,
              startDate: dateCalcs.startDate,
              endDate: dateCalcs.endDate,
              duration: dateCalcs.duration,
              status,
              joinDate: new Date(),
              renewalDate: dateCalcs.renewalDate,
              expiryDate: dateCalcs.expiryDate,
              paymentStatus,
              paymentMode: parse.data.membershipPaymentMode || "Cash",
              amountPaid,
              totalAmount,
              discount,
              remainingBalance,
              personalTrainerIncluded: parse.data.membershipPTIncluded ?? false,
              ptStartDate: parse.data.membershipPTIncluded && parse.data.membershipPTStartDate ? new Date(parse.data.membershipPTStartDate) : null,
              ptEndDate: parse.data.membershipPTIncluded && parse.data.membershipPTEndDate ? new Date(parse.data.membershipPTEndDate) : null,
              ptTrainerName: parse.data.membershipPTIncluded ? parse.data.membershipPTTrainerName : null,
              notes: parse.data.membershipNotes,
              remarks: parse.data.membershipRemarks,
            },
          });
        }

        return newUser;
      });

      // Async send notifications
      if (referrerIdToNotify && newUserId) {
        sendReferralNotifications(referrerIdToNotify, newUserId, referralCode!.trim()).catch(e => {
          console.error("[Referral Notification Error]", e);
        });
      }

      return apiResponse({
        message: "User created successfully.",
        user,
      });
    }

    // ==========================
    // LOGOUT
    // ==========================

    if (action === "logout") {
      let cookieStore;
      try {
        cookieStore = await import("next/headers").then((m) => m.cookies());
      } catch {
        // Ignore if headers cannot be resolved
      }

      // Invalidate the session in the database so the JWT can't be replayed
      try {
        if (cookieStore) {
          const token = cookieStore.get(COOKIE_NAME)?.value;
          if (token) {
            const { jwtVerify } = await import("jose");
            const secret = new TextEncoder().encode(env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret).catch(() => ({ payload: null }));
            if (payload && payload.sub) {
              const userId = parseInt(String(payload.sub), 10);
              if (!isNaN(userId)) {
                await prisma.user.update({
                  where: { id: userId },
                  data: { currentSessionId: null },
                }).catch(() => {}); // non-fatal — cookie deletion below still logs out
              }
            }
          }
        }
      } catch (err) {
        console.error("[Auth API] Session invalidation error during logout:", err);
      }

      // Delete cookie from Next.js headers store (avoids Next.js overriding NextResponse cookies)
      try {
        if (cookieStore) {
          cookieStore.delete(COOKIE_NAME);
        }
      } catch (err) {
        console.warn("[Auth API] Failed to delete cookie from next/headers:", err);
      }

      const response = apiResponse({ message: "Logged out." });

      // Fallback: Delete cookie on the NextResponse object
      try {
        response.cookies.set(COOKIE_NAME, "", {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 0,
          path: "/",
          expires: new Date(0),
        });
      } catch (err) {
        console.warn("[Auth API] Failed to set deleted cookie on response object:", err);
      }

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