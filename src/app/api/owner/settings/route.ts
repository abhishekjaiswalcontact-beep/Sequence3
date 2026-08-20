import { prisma } from "@/lib/prisma";
import { requireOwner, apiError, apiResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireOwner();

    const settings = await prisma.ownerSetting.findMany();
    const settingsMap: Record<string, string> = {};

    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    // Default fallbacks if empty
    const defaults = {
      gymName: settingsMap.gymName || "PINAKA FITNESS CLUB",
      gymAddress: settingsMap.gymAddress || "Plot 42, Fitness Hub, Central Avenue, Sector 5",
      gymPhone: settingsMap.gymPhone || "+91 98765 43210",
      gymEmail: settingsMap.gymEmail || "contact@pinakafitness.com",
      monthlyPlanPrice: settingsMap.monthlyPlanPrice || "1500",
      quarterlyPlanPrice: settingsMap.quarterlyPlanPrice || "4000",
      yearlyPlanPrice: settingsMap.yearlyPlanPrice || "12000",
      currency: settingsMap.currency || "₹",
      securityMode: settingsMap.securityMode || "Strict Single Device Session",
      auditLoggingEnabled: settingsMap.auditLoggingEnabled || "true",
    };

    return apiResponse(defaults);
  } catch (error) {
    console.error("[OWNER_SETTINGS_GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();

    const keys = Object.keys(body);

    for (const key of keys) {
      const value = String(body[key]);
      await prisma.ownerSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }

    // Log Audit Event
    await prisma.auditLog.create({
      data: {
        action: "SETTINGS_CHANGED",
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: "OWNER",
        description: `Owner updated gym business settings.`,
      }
    }).catch(() => {});

    return apiResponse({ message: "Owner settings updated successfully." });
  } catch (error) {
    console.error("[OWNER_SETTINGS_POST]", error);
    return apiError("Internal server error", 500);
  }
}
