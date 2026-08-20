import { getSession, apiResponse } from '@/lib/auth';
export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return apiResponse({ authenticated: false });
  }

  return apiResponse({
    authenticated: true,
    user: {
      id: session.sub,
      email: session.email,
      name: session.name,
      isAdmin: session.isAdmin || session.isOwner || false,
      isOwner: session.isOwner || false,
      role: session.role || (session.isOwner ? "OWNER" : session.isAdmin ? "ADMIN" : "MEMBER"),
    },
  });
}
