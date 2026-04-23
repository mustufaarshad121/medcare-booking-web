import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';
import NotificationCenter from '@/components/admin/NotificationCenter';
import type { NotificationLog } from '@/lib/types';

export const metadata = { title: 'Notifications — MedCare Admin' };

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login');

  const service = createServiceClient();
  let logs: NotificationLog[] = [];
  try {
    const { data } = await service
      .from('notification_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);
    logs = (data ?? []) as NotificationLog[];
  } catch { /* table not set up yet */ }

  return (
    <div>
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Notification Center</h1>
        <p className="text-sm text-gray-500 mt-0.5">Broadcast messages and view notification history</p>
      </div>
      <div className="p-8">
        <NotificationCenter initialLogs={logs} />
      </div>
    </div>
  );
}
