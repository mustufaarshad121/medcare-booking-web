import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (request.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Admin authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;
  if (status !== 'confirmed' && status !== 'cancelled') {
    return NextResponse.json({ error: 'INVALID_STATUS', message: "Status must be 'confirmed' or 'cancelled'" }, { status: 400 });
  }

  try {
    const ref = adminDb.collection('appointments').doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Appointment not found' }, { status: 404 });
    }
    await ref.update({ status });
    return NextResponse.json({ appointment: { id, status } });
  } catch (err) {
    return NextResponse.json({ error: 'DB_ERROR', message: String(err) }, { status: 500 });
  }
}
