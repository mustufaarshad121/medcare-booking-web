import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';
import NotificationCompose from '@/components/admin/NotificationCompose';

export const metadata = { title: 'Notifications — MedCare Admin' };

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login');

  const service = createServiceClient();
  const { data } = await service
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <div className="bg-[#0f3460] px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-white/60 mt-0.5">Compose and manage notifications</p>
      </div>
      <div className="p-8">
        <NotificationCompose initialNotifications={data ?? []} />
      </div>
    </div>
  );
}
