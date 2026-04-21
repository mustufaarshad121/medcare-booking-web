import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  if (body.status !== 'cancelled') {
    return NextResponse.json({ error: 'INVALID_STATUS', message: 'Only cancellation is allowed' }, { status: 400 });
  }

  // Fetch appointment — RLS ensures it belongs to this user
  const { data: existing } = await supabase
    .from('appointments')
    .select('id, status, user_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'NOT_FOUND', message: 'Appointment not found' }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN', message: 'Access denied' }, { status: 403 });
  }
  if (existing.status === 'cancelled') {
    return NextResponse.json({ error: 'ALREADY_CANCELLED', message: 'Appointment is already cancelled' }, { status: 409 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error) {
    return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointment: data });
}
