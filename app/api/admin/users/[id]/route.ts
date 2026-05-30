import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

function guard(req: NextRequest) {
  return req.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();

  const update: Record<string, unknown> = {};
  if (body.full_name !== undefined) update.fullName = body.full_name;
  if (body.phone !== undefined) update.phone = body.phone;
  if (body.email !== undefined) update.email = body.email;

  try {
    const ref = adminDb.collection('users').doc(id);
    await ref.update(update);
    const updated = await ref.get();
    const data = updated.data()!;
    return NextResponse.json({
      profile: {
        id,
        email: data.email ?? null,
        full_name: data.fullName ?? null,
        phone: data.phone ?? null,
        created_at: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
