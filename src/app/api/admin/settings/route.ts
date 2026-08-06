import { prisma } from '@/lib/prisma';
import { requireAdmin, apiError, apiResponse } from '@/lib/auth';

export const runtime = "nodejs";

// GET - Retrieve system settings
export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.systemSetting.findMany();
    
    // Map to simple key-value object
    const config: Record<string, string> = {};
    settings.forEach(s => {
      config[s.key] = s.value;
    });

    // Provide default values if not present
    if (config['whatsapp_reminders_enabled'] === undefined) {
      config['whatsapp_reminders_enabled'] = 'false';
    }

    return apiResponse(config);
  } catch (error) {
    console.error("[ADMIN_SETTINGS_GET]", error);
    return apiError("Unauthorized", 403);
  }
}

// POST - Update or create system settings
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    const updates: Array<{ key: string; value: string }> = [];

    // Support both single update { key, value } or multiple key-values { whatsapp_reminders_enabled: 'true' }
    if (body.key && body.value !== undefined) {
      updates.push({ key: body.key, value: String(body.value) });
    } else {
      Object.entries(body).forEach(([k, v]) => {
        updates.push({ key: k, value: String(v) });
      });
    }

    if (updates.length === 0) {
      return apiError("No settings values provided", 400);
    }

    // Run updates in transaction
    const results = await prisma.$transaction(
      updates.map(u => 
        prisma.systemSetting.upsert({
          where: { key: u.key },
          update: { value: u.value },
          create: { key: u.key, value: u.value },
        })
      )
    );

    const config: Record<string, string> = {};
    results.forEach(s => {
      config[s.key] = s.value;
    });

    return apiResponse({
      message: "Settings updated successfully",
      settings: config,
    });
  } catch (error) {
    console.error("[ADMIN_SETTINGS_POST]", error);
    return apiError("Unauthorized or Bad Request", 403);
  }
}
