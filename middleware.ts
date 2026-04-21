import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

const PROTECTED_PATIENT = ['/book', '/bookings'];
const AUTH_PAGES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes — they handle their own auth
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Admin route protection (not the login page itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE);
    if (adminCookie?.value !== ADMIN_SESSION_VALUE) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Refresh Supabase session and get user
  const { supabaseResponse, user } = await updateSession(request);

  // Redirect unauthenticated users away from protected patient pages
  const isProtected = PROTECTED_PATIENT.some((r) => pathname.startsWith(r));
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect already-authenticated users away from login/register
  const isAuthPage = AUTH_PAGES.some((r) => pathname === r);
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
