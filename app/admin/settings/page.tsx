import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';
import SettingsPanel from '@/components/admin/SettingsPanel';

export const metadata = { title: 'Settings — MedCare Admin' };

export default async function SettingsPage() {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login');

  const service = createServiceClient();
  let settings: Record<string, string> = {};
  try {
    const { data } = await service.from('app_settings').select('*');
    (data ?? []).forEach((s: { key: string; value: string }) => { settings[s.key] = s.value; });
  } catch { /* table not set up yet */ }

  return (
    <div>
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure application settings and preferences</p>
      </div>
      <div className="p-8">
        <SettingsPanel initialSettings={settings} />
      </div>
    </div>
  );
}
