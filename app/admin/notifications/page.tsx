import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';
import { Bell, Info, Clock } from 'lucide-react';

export const metadata = { title: 'Notifications — MedCare Admin' };

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login');

  const service = createServiceClient();
  let notifications: Notification[] = [];
  try {
    const { data } = await service
      .from('notifications')
      .select('id, title, message, type, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    notifications = (data ?? []) as Notification[];
  } catch { /* table not set up yet */ }

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <div className="bg-[#0f3460] px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-white/60 mt-0.5">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="p-8">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell size={40} className="text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {notifications.map(n => (
              <div key={n.id} className="bg-[#16213e] rounded-2xl border border-slate-700 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    n.type === 'info' ? 'bg-blue-500/20' : 'bg-yellow-500/20'
                  }`}>
                    {n.type === 'info'
                      ? <Info size={16} className="text-blue-400" />
                      : <Clock size={16} className="text-yellow-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white text-sm">{n.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        n.type === 'info'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {n.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{n.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(n.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
