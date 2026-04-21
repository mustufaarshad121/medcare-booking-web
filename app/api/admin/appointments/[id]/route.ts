import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE);
  if (adminCookie?.value !== ADMIN_SESSION_VALUE) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Admin authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;

  if (status !== 'confirmed' && status !== 'cancelled') {
    return NextResponse.json({ error: 'INVALID_STATUS', message: "Status must be 'confirmed' or 'cancelled'" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: existing } = await service
    .from('appointments')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'NOT_FOUND', message: 'Appointment not found' }, { status: 404 });
  }

  const { data, error } = await service
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error) {
    return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointment: data });
}
