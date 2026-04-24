import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase/server'
import AppointmentsTable from '@/components/admin/AppointmentsTable'
import type { Appointment } from '@/lib/types'
import { Calendar, CheckCircle, XCircle } from 'lucide-react'

export const metadata = { title: 'Appointments — MedCare Admin' }

export default async function AppointmentsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login')

  const service = createServiceClient()
  let appointments: Appointment[] = []

  try {
    const { data } = await service
      .from('appointments')
      .select('*, doctor:doctors(*)')
      .order('appointment_date', { ascending: false })
    appointments = (data ?? []) as Appointment[]
  } catch {}

  const confirmed = appointments.filter(a => a.status === 'confirmed').length
  const cancelled = appointments.filter(a => a.status === 'cancelled').length

  return (
    <div>
      <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-900">Appointments</h1>
        <div className="flex items-center gap-5 mt-1.5">
          <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
            <Calendar size={14} />
            {appointments.length} total
          </span>
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
            <CheckCircle size={14} />
            {confirmed} confirmed
          </span>
          <span className="flex items-center gap-1.5 text-sm text-red-500 font-semibold">
            <XCircle size={14} />
            {cancelled} cancelled
          </span>
        </div>
      </div>
      <div className="p-8">
        <AppointmentsTable initialAppointments={appointments} />
      </div>
    </div>
  )
}
