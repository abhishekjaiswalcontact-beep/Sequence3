import { getSession, apiResponse } from '@/lib/auth';

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
      isAdmin: session.isAdmin,
    },
  });
}
