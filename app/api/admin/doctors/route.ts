import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

function guard(req: NextRequest) {
  return req.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE;
}

export async function GET(request: NextRequest) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const service = createServiceClient();
  const { data, error } = await service.from('doctors').select('*').order('specialty');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ doctors: data });
}

export async function POST(request: NextRequest) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const body = await request.json();
  const { name, specialty, bio, consultation_fee, is_available, experience_years } = body;
  if (!name?.trim() || !specialty) {
    return NextResponse.json({ error: 'name and specialty are required' }, { status: 400 });
  }
  const service = createServiceClient();
  const { data, error } = await service
    .from('doctors')
    .insert({
      name: name.trim(),
      specialty,
      bio: bio ?? '',
      consultation_fee: consultation_fee ?? 150,
      is_available: is_available ?? true,
      experience_years: experience_years ?? 0,
    })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ doctor: data }, { status: 201 });
}
