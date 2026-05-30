import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyUser } from '@/lib/verify-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const decoded = await verifyUser(request);
  if (!decoded) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  if (body.status !== 'cancelled') {
    return NextResponse.json({ error: 'INVALID_STATUS', message: 'Only cancellation is allowed' }, { status: 400 });
  }

  try {
    const docRef = adminDb.collection('appointments').doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Appointment not found' }, { status: 404 });
    }

    const data = existing.data()!;
    if (data.userId !== decoded.uid) {
      return NextResponse.json({ error: 'FORBIDDEN', message: 'Access denied' }, { status: 403 });
    }
    if (data.status === 'cancelled') {
      return NextResponse.json({ error: 'ALREADY_CANCELLED', message: 'Appointment is already cancelled' }, { status: 409 });
    }

    await docRef.update({ status: 'cancelled' });
    return NextResponse.json({ appointment: { id, status: 'cancelled' } });
  } catch (err) {
    return NextResponse.json({ error: 'DB_ERROR', message: String(err) }, { status: 500 });
  }
}
