import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';
import DoctorsManager from '@/components/admin/DoctorsManager';
import type { DoctorWithFee } from '@/lib/types';

export const metadata = { title: 'Doctors — MedCare Admin' };

export default async function DoctorsPage() {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login');

  const service = createServiceClient();
  const { data: doctors } = await service.from('doctors').select('*').order('specialty');

  const available = (doctors ?? []).filter((d: Record<string, unknown>) => d.is_available !== false).length;

  return (
    <div>
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Doctor Management</h1>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-sm text-gray-500">{doctors?.length ?? 0} total</span>
          <span className="text-sm text-green-600 font-medium">{available} available</span>
        </div>
      </div>
      <div className="p-8">
        <DoctorsManager initialDoctors={(doctors ?? []) as DoctorWithFee[]} />
      </div>
    </div>
  );
}
