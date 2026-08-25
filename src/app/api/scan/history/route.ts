import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
export const runtime = "nodejs";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || !session.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIdNum = parseInt(session.sub);
    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const scans = await prisma.scanResult.findMany({
      where: { userId: userIdNum },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Parse workoutPlan JSON if needed
    type Scan = Awaited<ReturnType<typeof prisma.scanResult.findMany>>[number];
    const formattedScans = scans.map((scan: Scan) => {
      let parsedPlan = [];
      if (scan.workoutPlan) {
         try {
            parsedPlan = JSON.parse(scan.workoutPlan);
         } catch {
            console.error("Failed to parse workoutPlan for scan", scan.id);
         }
      }

      let vegDiet = null;
      let nonVegDiet = null;
      let dietPlanText = scan.dietPlan;

      if (scan.dietPlan) {
         try {
            if (scan.dietPlan.trim().startsWith('{')) {
               const parsedDiet = JSON.parse(scan.dietPlan);
               vegDiet = parsedDiet.vegDiet || null;
               nonVegDiet = parsedDiet.nonVegDiet || null;
               dietPlanText = parsedDiet.dietPlan || "";
            }
         } catch {
            console.error("Failed to parse dietPlan for scan", scan.id);
         }
      }

      // Parse rich feedback metadata if formatted as JSON
      let feedbackText = scan.feedback || "";
      let richData: Record<string, unknown> = {};
      if (scan.feedback && scan.feedback.trim().startsWith('{')) {
        try {
          richData = JSON.parse(scan.feedback);
          if (richData.postureFeedback) {
            feedbackText = String(richData.postureFeedback);
          }
        } catch {
          // Plain text feedback
        }
      }

      return {
        ...scan,
        ...richData,
        postureFeedback: feedbackText,
        feedback: feedbackText,
        workoutPlan: parsedPlan,
        weeklyPlan: parsedPlan,
        vegDiet,
        nonVegDiet,
        dietPlan: dietPlanText
      };
    });

    return NextResponse.json(formattedScans);
  } catch (error) {
    console.error("Fetch History Error:", error);
    // Return empty array instead of 500 so UI doesn't crash
    return NextResponse.json([]);
  }
}

