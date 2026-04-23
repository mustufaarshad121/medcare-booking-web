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
  const { name, specialty, location, bio, avatar_color, consultation_fee, is_available } = body;
  if (!name?.trim() || !specialty || !location) {
    return NextResponse.json({ error: 'name, specialty, location are required' }, { status: 400 });
  }
  const service = createServiceClient();
  const { data, error } = await service
    .from('doctors')
    .insert({ name: name.trim(), specialty, location, bio: bio ?? '', avatar_color: avatar_color ?? '#0f3460', consultation_fee: consultation_fee ?? 150, is_available: is_available ?? true })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ doctor: data }, { status: 201 });
}
