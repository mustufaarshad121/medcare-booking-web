import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase/server'
import {
  Calendar, CheckCircle, XCircle,
  Stethoscope, Users, TrendingUp, Award, Activity,
} from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import AppointmentTrend from '@/components/admin/charts/AppointmentTrend'
import StatusDonut from '@/components/admin/charts/StatusDonut'
import DoctorBookings from '@/components/admin/charts/DoctorBookings'
import type { TrendPoint } from '@/components/admin/charts/AppointmentTrend'
import type { DoctorPoint } from '@/components/admin/charts/DoctorBookings'

export const metadata = { title: 'Analytics — MedCare Admin' }

type RawAppt = {
  id: string
  status: string
  appointment_date: string
  doctor_name: string | null
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login')

  const service = createServiceClient()
  const today = new Date()

  let appts: RawAppt[] = []
  let totalDoctors = 0
  let totalUsers   = 0

  try {
    const { data } = await service
      .from('appointments')
      .select('id, status, appointment_date, doctor_name')
    appts = (data ?? []) as RawAppt[]
  } catch {}

  try {
    const { count } = await service.from('doctors').select('id', { count: 'exact', head: true })
    totalDoctors = count ?? 0
  } catch {}

  try {
    const { count } = await service.from('profiles').select('id', { count: 'exact', head: true })
    totalUsers = count ?? 0
  } catch {}

  /* ── Stats ───────────────────────────────────────────────────────────── */
  const confirmed = appts.filter(a => a.status === 'confirmed')
  const cancelled = appts.filter(a => a.status === 'cancelled')

  /* ── 7-day trend (group by DATE(appointment_date)) ───────────────────── */
  const dayMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dayMap[d.toISOString().split('T')[0]] = 0
  }
  appts.forEach(a => {
    const dateKey = a.appointment_date?.split('T')[0] ?? a.appointment_date
    if (dateKey in dayMap) dayMap[dateKey]++
  })
  const trendData: TrendPoint[] = Object.entries(dayMap).map(([date, count]) => ({
    date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
    appointments: count,
    revenue: 0,
  }))

  /* ── Doctor bar chart (group by doctor_name) ─────────────────────────── */
  const docMap: Record<string, DoctorPoint> = {}
  appts.forEach(a => {
    const name = a.doctor_name ?? 'Unknown'
    if (!docMap[name]) docMap[name] = { name, appointments: 0, revenue: 0 }
    docMap[name].appointments++
  })
  const topDoctors = Object.values(docMap)
    .sort((a, b) => b.appointments - a.appointments)
    .slice(0, 5)

  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const medals  = ['bg-amber-400', 'bg-slate-400', 'bg-amber-700', 'bg-slate-500', 'bg-slate-500']

  return (
    <div>
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analytics Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">{dateStr}</p>
        </div>
        <span className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live data
        </span>
      </div>

      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatsCard title="Total Bookings" value={appts.length.toLocaleString()}     bg="bg-blue-50"   border="border-blue-500"   icon={<Calendar    size={20} className="text-blue-600"   />} />
          <StatsCard title="Confirmed"      value={confirmed.length.toLocaleString()} bg="bg-green-50"  border="border-green-500"  icon={<CheckCircle size={20} className="text-green-600"  />} />
          <StatsCard title="Cancelled"      value={cancelled.length.toLocaleString()} bg="bg-red-50"    border="border-red-400"    icon={<XCircle     size={20} className="text-red-500"    />} />
          <StatsCard title="Doctors"        value={totalDoctors.toLocaleString()}     bg="bg-teal-50"   border="border-teal-500"   icon={<Stethoscope size={20} className="text-teal-600"   />} />
          <StatsCard title="Users"          value={totalUsers.toLocaleString()}       bg="bg-purple-50" border="border-purple-500" icon={<Users       size={20} className="text-purple-600" />} />
        </div>

        {/* Row 1: Trend (2/3) + Donut (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Appointment Trend</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 7 days by date</p>
              </div>
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={17} className="text-blue-600" />
              </div>
            </div>
            <AppointmentTrend data={trendData} />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Status Breakdown</h3>
                <p className="text-xs text-slate-400 mt-0.5">Confirmed vs Cancelled</p>
              </div>
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Activity size={17} className="text-emerald-600" />
              </div>
            </div>
            <StatusDonut confirmed={confirmed.length} cancelled={cancelled.length} />
          </div>
        </div>

        {/* Row 2: Doctor Bookings bar chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Top Doctor Bookings</h3>
              <p className="text-xs text-slate-400 mt-0.5">Appointments per doctor</p>
            </div>
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Award size={17} className="text-amber-500" />
            </div>
          </div>
          <DoctorBookings data={topDoctors} />
        </div>

        {/* Top Performing Doctors table */}
        {topDoctors.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Award size={18} className="text-amber-500" />
              <h3 className="font-semibold text-slate-900">Top Performing Doctors</h3>
            </div>
            <div className="space-y-1">
              {topDoctors.map((doc, i) => (
                <div key={doc.name} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${medals[i]}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-[#0f3460]">{doc.appointments} appts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {appts.length === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100 rounded-2xl p-6 text-center">
            <Calendar size={32} className="text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-blue-700">No appointments yet</p>
            <p className="text-xs text-blue-500 mt-1">Charts will populate as bookings are made.</p>
          </div>
        )}
      </div>
    </div>
  )
}
