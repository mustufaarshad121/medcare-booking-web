import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

function guard(req: NextRequest) {
  return req.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE;
}

function toDto(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    name: data.name,
    specialty: data.specialty,
    bio: data.bio ?? null,
    consultation_fee: data.consultationFee ?? data.consultation_fee ?? 150,
    is_available: data.isAvailable ?? data.is_available ?? true,
    experience_years: data.experienceYears ?? data.experience_years ?? null,
    location: data.location ?? null,
  };
}

export async function GET(request: NextRequest) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  try {
    const snap = await adminDb.collection('doctors').orderBy('specialty').get();
    const doctors = snap.docs.map(d => toDto(d.id, d.data()));
    return NextResponse.json({ doctors });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const body = await request.json();
  const { name, specialty, bio, consultation_fee, is_available, experience_years, location } = body;
  if (!name?.trim() || !specialty) {
    return NextResponse.json({ error: 'name and specialty are required' }, { status: 400 });
  }
  try {
    const ref = adminDb.collection('doctors').doc();
    const payload = {
      name: name.trim(),
      specialty,
      bio: bio ?? '',
      consultationFee: consultation_fee ?? 150,
      isAvailable: is_available ?? true,
      experienceYears: experience_years ?? 0,
      location: location || 'New York',
      avatarColor: '#0f3460',
      createdAt: new Date(),
    };
    await ref.set(payload);
    return NextResponse.json({ doctor: toDto(ref.id, payload) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
