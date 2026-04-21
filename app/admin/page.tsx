import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';
import AppointmentsTable from '@/components/admin/AppointmentsTable';
import type { Appointment } from '@/lib/types';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';

export const metadata = { title: 'Admin Dashboard — MedCare Health' };

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_SESSION_COOKIE);
  if (adminCookie?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login');

  const service = createServiceClient();
  const { data: appointments } = await service
    .from('appointments')
    .select('*, doctor:doctors(*)')
    .order('appointment_date', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f3460]">Appointments Dashboard</h1>
          <p className="text-[#64748b] mt-1">
            {appointments?.length ?? 0} total appointment{(appointments?.length ?? 0) !== 1 ? 's' : ''} across all patients
          </p>
        </div>
        <AdminLogoutButton />
      </div>
      <AppointmentsTable initialAppointments={(appointments as Appointment[]) ?? []} />
    </div>
  );
}
