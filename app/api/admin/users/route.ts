import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (request.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const service = createServiceClient();
  const [profilesRes, apptRes] = await Promise.all([
    service.from('profiles').select('*').order('created_at', { ascending: false }),
    service.from('appointments').select('user_id'),
  ]);
  if (profilesRes.error) return NextResponse.json({ error: profilesRes.error.message }, { status: 500 });

  const countMap: Record<string, number> = {};
  (apptRes.data ?? []).forEach((a: { user_id: string }) => {
    countMap[a.user_id] = (countMap[a.user_id] ?? 0) + 1;
  });

  const profiles = (profilesRes.data ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    appointment_count: countMap[p.id as string] ?? 0,
  }));

  return NextResponse.json({ profiles });
}
