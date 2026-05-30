import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

function guard(req: NextRequest) {
  return req.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE;
}

export async function GET(request: NextRequest) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  try {
    const snap = await adminDb.collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    const notifications = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        message: data.message,
        type: data.type ?? 'info',
        target: data.target ?? 'all',
        sent_by: data.sentBy ?? 'admin',
        created_at: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });
    return NextResponse.json({ notifications });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const body = await request.json();
  const { message, type, target } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  try {
    const ref = adminDb.collection('notifications').doc();
    const now = new Date();
    await ref.set({
      message: message.trim(),
      type: type ?? 'info',
      target: target ?? 'all',
      sentBy: 'admin',
      createdAt: now,
    });
    return NextResponse.json({
      notification: {
        id: ref.id,
        message: message.trim(),
        type: type ?? 'info',
        target: target ?? 'all',
        sent_by: 'admin',
        created_at: now.toISOString(),
      },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
