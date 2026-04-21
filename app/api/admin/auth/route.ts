import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminCredentials,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_VALUE,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json(
      { error: 'INVALID_CREDENTIALS', message: 'Invalid username or password' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE);
  if (adminCookie?.value !== ADMIN_SESSION_VALUE) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { maxAge: 0, path: '/' });
  return response;
}
