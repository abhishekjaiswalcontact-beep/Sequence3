import { requirePermission, apiResponse, apiError, NON_OWNER_USER_FILTER, isOwnerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const CreateWorkoutSchema = z.object({
  userId: z.number(),
  title: z.string().min(2),
  goal: z.string().min(2),
  level: z.string().optional(),
  duration: z.string().optional(),
  daysPerWeek: z.number().optional(),
  exercises: z.string(), // JSON string or text
  notes: z.string().optional(),
});

const UpdateWorkoutSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  goal: z.string().optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  daysPerWeek: z.number().optional(),
  exercises: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    await requirePermission("MANAGE_WORKOUT_PLANS");
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: parseInt(userId, 10) },
        select: { id: true, isOwner: true, role: true }
      });
      if (!targetUser || isOwnerUser(targetUser)) {
        return apiResponse([]);
      }
    }

    const where: Prisma.WorkoutPlanWhereInput = {
      user: NON_OWNER_USER_FILTER,
    };

    if (userId) {
      where.userId = parseInt(userId, 10);
    }

    const workoutPlans = await prisma.workoutPlan.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse(workoutPlans);
  } catch (error) {
    console.error("[WORKOUTS_GET]", error);
    return apiError(error instanceof Error ? error.message : "Unauthorized", 403);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission("MANAGE_WORKOUT_PLANS");
    const body = await req.json();
    const parse = CreateWorkoutSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid workout plan details", 400);
    }

    const targetUser = await prisma.user.findUnique({ where: { id: parse.data.userId } });
    if (!targetUser || isOwnerUser(targetUser)) {
      return apiError("User not found or access denied", 404);
    }

    const newWorkout = await prisma.workoutPlan.create({
      data: {
        userId: parse.data.userId,
        title: parse.data.title,
        goal: parse.data.goal,
        level: parse.data.level || "Beginner",
        duration: parse.data.duration || "4 Weeks",
        daysPerWeek: parse.data.daysPerWeek || 4,
        exercises: parse.data.exercises,
        notes: parse.data.notes || "",
        isCustom: true,
      },
    });

    return apiResponse(newWorkout, 201);
  } catch (error) {
    console.error("[WORKOUTS_POST]", error);
    return apiError(error instanceof Error ? error.message : "Failed to create workout plan", 400);
  }
}

export async function PATCH(req: Request) {
  try {
    await requirePermission("MANAGE_WORKOUT_PLANS");
    const body = await req.json();
    const parse = UpdateWorkoutSchema.safeParse(body);

    if (!parse.success) {
      return apiError("Invalid workout plan update data", 400);
    }

    const { id, ...data } = parse.data;

    const existing = await prisma.workoutPlan.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!existing || isOwnerUser(existing.user)) {
      return apiError("Workout plan not found or access denied", 404);
    }

    const updated = await prisma.workoutPlan.update({
      where: { id },
      data,
    });

    return apiResponse(updated);
  } catch (error) {
    console.error("[WORKOUTS_PATCH]", error);
    return apiError(error instanceof Error ? error.message : "Failed to update workout plan", 400);
  }
}

export async function DELETE(req: Request) {
  try {
    await requirePermission("MANAGE_WORKOUT_PLANS");
    const { id } = await req.json();

    if (!id || typeof id !== "number") {
      return apiError("Invalid workout plan ID", 400);
    }

    const existing = await prisma.workoutPlan.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!existing || isOwnerUser(existing.user)) {
      return apiError("Workout plan not found or access denied", 404);
    }

    await prisma.workoutPlan.delete({ where: { id } });
    return apiResponse({ message: "Workout plan deleted successfully" });
  } catch (error) {
    console.error("[WORKOUTS_DELETE]", error);
    return apiError(error instanceof Error ? error.message : "Failed to delete workout plan", 400);
  }
}

