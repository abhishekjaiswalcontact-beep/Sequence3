import { getSession, getAdminPermissions, apiResponse, apiError } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (!session.isAdmin && !session.isOwner)) {
      return apiError("Unauthorized", 401);
    }

    const userId = parseInt(session.sub, 10);
    const permissions = await getAdminPermissions(userId);

    return apiResponse({
      userId,
      isOwner: !!session.isOwner,
      isAdmin: !!session.isAdmin,
      permissions,
    });
  } catch (error) {
    console.error("[PERMISSIONS_ME_GET]", error);
    return apiError("Internal server error", 500);
  }
}
