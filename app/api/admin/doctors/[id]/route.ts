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

  // Map snake_case fields from the form to camelCase for Firestore
  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.specialty !== undefined) update.specialty = body.specialty;
  if (body.bio !== undefined) update.bio = body.bio;
  if (body.consultation_fee !== undefined) update.consultationFee = body.consultation_fee;
  if (body.is_available !== undefined) update.isAvailable = body.is_available;
  if (body.experience_years !== undefined) update.experienceYears = body.experience_years;
  if (body.location !== undefined) update.location = body.location;

  try {
    const ref = adminDb.collection('doctors').doc(id);
    await ref.update(update);
    const updated = await ref.get();
    const data = updated.data()!;
    return NextResponse.json({
      doctor: {
        id,
        name: data.name,
        specialty: data.specialty,
        bio: data.bio ?? null,
        consultation_fee: data.consultationFee ?? 150,
        is_available: data.isAvailable ?? true,
        experience_years: data.experienceYears ?? null,
        location: data.location ?? null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const { id } = await params;
  try {
    await adminDb.collection('doctors').doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
