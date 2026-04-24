import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

function guard(req: NextRequest) {
  return req.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE;
}

export async function GET(request: NextRequest) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const service = createServiceClient();
  const { data, error } = await service
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (guard(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const body = await request.json();
  const { message, type, target } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  const service = createServiceClient();
  const { data, error } = await service
    .from('notifications')
    .insert({
      message: message.trim(),
      type: type ?? 'info',
      target: target ?? 'all',
      sent_by: 'admin',
    })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notification: data }, { status: 201 });
}
