import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (request.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    const [usersSnap, apptsSnap] = await Promise.all([
      adminDb.collection('users').orderBy('createdAt', 'desc').get(),
      adminDb.collection('appointments').get(),
    ]);

    const countMap: Record<string, number> = {};
    apptsSnap.docs.forEach(d => {
      const uid = d.data().userId;
      if (uid) countMap[uid] = (countMap[uid] ?? 0) + 1;
    });

    const profiles = usersSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        email: data.email ?? null,
        full_name: data.fullName ?? null,
        phone: data.phone ?? null,
        created_at: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        appointment_count: countMap[d.id] ?? 0,
      };
    });

    return NextResponse.json({ profiles });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
