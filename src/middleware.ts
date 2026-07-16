import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'auth_token';

// Strategy: Lock by default, allow specific public routes
const PUBLIC_ROUTES = ['/', '/login', '/api/contact', '/careers']; // Landing page, Login & Careers
const AUTH_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 1. Permanent redirect for /signup
  if (pathname.startsWith('/signup')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Validate Token if exists
  let payload: { sub: string; isAdmin?: boolean } | null = null;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload: p } = await jwtVerify(token, secret);
      payload = p as { sub: string; isAdmin?: boolean };
    } catch {
      // Invalid/expired token -> clear it
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  const isAuthenticated = !!payload;
  const isAdmin = !!(payload?.isAdmin);

  // 3. Authorization Logic

  // Allow public routes and static assets
  const isStaticAsset = /\.(png|jpg|jpeg|gif|svg|webp|ico|json|mp4|webm)$/.test(pathname);

  if (
    PUBLIC_ROUTES.includes(pathname) || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/trainer') ||
    isStaticAsset
  ) {
    // If logged in, redirect away from /login
    if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect Admin Dashboard
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login', request.url));
    if (!isAdmin) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  // Protect all other routes (dashboard, scan, etc.)
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/contact (public contact API)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/contact|_next/static|_next/image|favicon.ico).*)',
  ],
};
