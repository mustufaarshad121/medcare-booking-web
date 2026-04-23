import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';
import UsersManager from '@/components/admin/UsersManager';
import type { UserProfile } from '@/lib/types';

export const metadata = { title: 'Users — MedCare Admin' };

export default async function UsersPage() {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login');

  const service = createServiceClient();
  let profiles: UserProfile[] = [];

  try {
    const [profilesRes, apptRes] = await Promise.all([
      service.from('profiles').select('*').order('created_at', { ascending: false }),
      service.from('appointments').select('user_id'),
    ]);
    const countMap: Record<string, number> = {};
    (apptRes.data ?? []).forEach((a: { user_id: string }) => {
      countMap[a.user_id] = (countMap[a.user_id] ?? 0) + 1;
    });
    profiles = ((profilesRes.data ?? []) as UserProfile[]).map(p => ({
      ...p,
      appointment_count: countMap[p.id] ?? 0,
    }));
  } catch { /* profiles table not set up yet */ }

  const blocked = profiles.filter(p => p.is_blocked).length;

  return (
    <div>
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-sm text-gray-500">{profiles.length} registered</span>
          {blocked > 0 && <span className="text-sm text-red-500 font-medium">{blocked} blocked</span>}
        </div>
      </div>
      <div className="p-8">
        <UsersManager initialProfiles={profiles} />
      </div>
    </div>
  );
}
