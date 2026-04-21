import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE);
  if (adminCookie?.value !== ADMIN_SESSION_VALUE) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Admin authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const locationFilter = searchParams.get('location');

  const service = createServiceClient();
  let query = service
    .from('appointments')
    .select('*, doctor:doctors(*)')
    .order('appointment_date', { ascending: false });

  if (statusFilter) query = query.eq('status', statusFilter);
  if (locationFilter) query = query.eq('location', locationFilter);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointments: data });
}
