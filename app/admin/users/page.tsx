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
    const { data } = await service
      .from('profiles')
      .select('id, full_name, email, phone, created_at')
      .order('created_at', { ascending: false });
    profiles = (data ?? []) as UserProfile[];
  } catch { /* profiles table not set up yet */ }

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <div className="bg-[#0f3460] px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">User Management</h1>
        <p className="text-sm text-white/60 mt-0.5">{profiles.length} registered users</p>
      </div>
      <div className="p-8">
        <UsersManager initialProfiles={profiles} />
      </div>
    </div>
  );
}
