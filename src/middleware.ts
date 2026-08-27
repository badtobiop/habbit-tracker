import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_anime_habit_tracker_jwt_key_2026_x89f';
const secretKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'anime_habit_auth_token';

// Routes that require strict user authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/calendar',
  '/habits',
  '/anime',
  '/stats',
  '/achievements',
  '/profile',
  '/admin',
];

// Routes for signing in / up
const AUTH_ROUTES = ['/login', '/signup'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let isValidToken = false;
  let userPayload: { userId: string; email: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload && payload.userId) {
        isValidToken = true;
        userPayload = payload as unknown as { userId: string; email: string; role: string };
      }
    } catch (err) {
      isValidToken = false;
    }
  }

  // 1. Strict Protection: If visitor tries to access dashboard without valid login token -> Redirect to /login
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Strict Protection for Master Admin portal -> Only for utkarshdhakane2@gmail.com
  if (pathname.startsWith('/admin')) {
    const isMasterAdmin = userPayload?.email?.toLowerCase() === 'utkarshdhakane2@gmail.com' || userPayload?.role === 'admin';
    if (!isMasterAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Allow direct access to /login and /signup pages so users can switch accounts or register new ones
  return NextResponse.next();
}


export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calendar/:path*',
    '/habits/:path*',
    '/anime/:path*',
    '/stats/:path*',
    '/achievements/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
};
