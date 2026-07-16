import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
    const formattedScans = scans.map((scan) => {
      let parsedPlan = [];
      if (scan.workoutPlan) {
         try {
            parsedPlan = JSON.parse(scan.workoutPlan);
         } catch {
            console.error("Failed to parse workoutPlan for scan", scan.id);
         }
      }
      return {
        ...scan,
        workoutPlan: parsedPlan
      };
    });

    return NextResponse.json(formattedScans);
  } catch (error) {
    console.error("Fetch History Error:", error);
    // Return empty array instead of 500 so UI doesn't crash
    return NextResponse.json([]);
  }
}
