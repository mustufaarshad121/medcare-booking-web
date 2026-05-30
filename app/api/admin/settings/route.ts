import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

function guard(req: NextRequest) {
  return req.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE;
}

export async function GET(request: NextRequest) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  try {
    const snap = await adminDb.collection('appSettings').get();
    const settings: Record<string, string> = {};
    snap.docs.forEach(d => {
      settings[d.id] = d.data().value ?? '';
    });
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const updates: Record<string, string> = await request.json();
  try {
    const batch = adminDb.batch();
    Object.entries(updates).forEach(([key, value]) => {
      const ref = adminDb.collection('appSettings').doc(key);
      batch.set(ref, { value, updatedAt: new Date() }, { merge: true });
    });
    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
