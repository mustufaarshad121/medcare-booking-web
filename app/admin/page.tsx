import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';
import {
  Calendar, CheckCircle, XCircle, DollarSign,
  Stethoscope, Users, TrendingUp, Award,
} from 'lucide-react';

export const metadata = { title: 'Analytics — MedCare Admin' };

/* ─── Inline bar chart (no external library) ────────────────────────────── */
function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-32 mt-2 pb-1">
      {data.map((item, i) => {
        const pct = (item.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full">
            <div className="flex-1 w-full relative flex items-end">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{ height: `${pct}%`, backgroundColor: color, minHeight: item.value > 0 ? '4px' : '0' }}
              />
            </div>
            <span className="text-xs text-slate-400 leading-none w-full text-center truncate">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── KPI stat card ─────────────────────────────────────────────────────── */
function StatCard({
  title, value, icon, bg, border,
}: {
  title: string; value: string; icon: React.ReactNode; bg: string; border: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border-l-4 ${border} p-5 shadow-sm hover:shadow-md transition-all`}>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login');

  const service = createServiceClient();
  const today   = new Date();

  type RawDoc  = { name: string; specialty: string; consultation_fee?: number };
  type RawAppt = {
    id: string; status: string; appointment_date: string;
    doctor_id: string; doctor: RawDoc | null;
  };

  /* ── Fetch with per-query error handling ─────────────────────────────── */
  let appts: RawAppt[] = [];
  let totalDoctors = 0;
  let totalUsers   = 0;

  try {
    /* Try with consultation_fee (requires admin-setup.sql) */
    const { data } = await service
      .from('appointments')
      .select('id, status, appointment_date, doctor_id, doctor:doctors(name, specialty, consultation_fee)');
    appts = ((data ?? []) as unknown as RawAppt[]);
  } catch {
    /* Fallback without consultation_fee column */
    try {
      const { data } = await service
        .from('appointments')
        .select('id, status, appointment_date, doctor_id, doctor:doctors(name, specialty)');
      appts = ((data ?? []) as unknown as RawAppt[]);
    } catch { /* no appointments table */ }
  }

  try {
    const { count } = await service.from('doctors').select('id', { count: 'exact', head: true });
    totalDoctors = count ?? 0;
  } catch {}

  try {
    const { count } = await service.from('profiles').select('id', { count: 'exact', head: true });
    totalUsers = count ?? 0;
  } catch {}

  /* ── Compute stats ───────────────────────────────────────────────────── */
  const confirmed = appts.filter(a => a.status === 'confirmed');
  const cancelled = appts.filter(a => a.status === 'cancelled');
  const revenue   = confirmed.reduce((s, a) => s + (a.doctor?.consultation_fee ?? 0), 0);

  /* Last 7 days */
  const dayMap: Record<string, { count: number; rev: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    dayMap[d.toISOString().split('T')[0]] = { count: 0, rev: 0 };
  }
  appts.forEach(a => {
    if (a.appointment_date in dayMap) {
      dayMap[a.appointment_date].count++;
      if (a.status === 'confirmed')
        dayMap[a.appointment_date].rev += a.doctor?.consultation_fee ?? 0;
    }
  });
  const apptByDay = Object.entries(dayMap).map(([d, v]) => ({ label: d.split('-')[2], value: v.count }));
  const revByDay  = Object.entries(dayMap).map(([d, v]) => ({ label: d.split('-')[2], value: v.rev }));

  /* Specialty breakdown */
  const specMap: Record<string, number> = {};
  appts.forEach(a => { const s = a.doctor?.specialty ?? 'Unknown'; specMap[s] = (specMap[s] ?? 0) + 1; });
  const specData = Object.entries(specMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const specMax  = Math.max(...specData.map(s => s[1]), 1);

  /* Top doctors */
  const docMap: Record<string, { name: string; specialty: string; count: number; rev: number }> = {};
  appts.forEach(a => {
    if (!a.doctor_id) return;
    if (!docMap[a.doctor_id]) docMap[a.doctor_id] = { name: a.doctor?.name ?? 'Unknown', specialty: a.doctor?.specialty ?? '', count: 0, rev: 0 };
    docMap[a.doctor_id].count++;
    if (a.status === 'confirmed') docMap[a.doctor_id].rev += a.doctor?.consultation_fee ?? 0;
  });
  const topDocs = Object.entries(docMap)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const medals  = ['bg-amber-400','bg-slate-400','bg-amber-700','bg-slate-500','bg-slate-500'];

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
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
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Bookings" value={appts.length.toLocaleString()}    bg="bg-blue-50"   border="border-blue-500"   icon={<Calendar size={20} className="text-blue-600" />} />
          <StatCard title="Confirmed"      value={confirmed.length.toLocaleString()} bg="bg-green-50"  border="border-green-500"  icon={<CheckCircle size={20} className="text-green-600" />} />
          <StatCard title="Cancelled"      value={cancelled.length.toLocaleString()} bg="bg-red-50"    border="border-red-400"    icon={<XCircle size={20} className="text-red-500" />} />
          <StatCard title="Revenue"        value={`$${revenue.toLocaleString()}`}   bg="bg-amber-50"  border="border-amber-500"  icon={<DollarSign size={20} className="text-amber-600" />} />
          <StatCard title="Doctors"        value={totalDoctors.toLocaleString()}    bg="bg-teal-50"   border="border-teal-500"   icon={<Stethoscope size={20} className="text-teal-600" />} />
          <StatCard title="Users"          value={totalUsers.toLocaleString()}      bg="bg-purple-50" border="border-purple-500" icon={<Users size={20} className="text-purple-600" />} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-semibold text-slate-900">Appointments — Last 7 Days</h3>
                <p className="text-xs text-slate-400 mt-0.5">Daily booking volume</p>
              </div>
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={17} className="text-blue-600" />
              </div>
            </div>
            <BarChart data={apptByDay} color="#0f3460" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-semibold text-slate-900">Revenue — Last 7 Days</h3>
                <p className="text-xs text-slate-400 mt-0.5">Daily revenue in USD</p>
              </div>
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign size={17} className="text-green-600" />
              </div>
            </div>
            <BarChart data={revByDay} color="#16a085" />
          </div>
        </div>

        {/* Specialty + Top Doctors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Specialty Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">Bookings by Specialty</h3>
            {specData.length > 0 ? (
              <div className="space-y-4">
                {specData.map(([spec, count]) => (
                  <div key={spec}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-700 truncate">{spec}</span>
                      <span className="text-sm font-bold text-slate-900 ml-3 flex-shrink-0">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0f3460] to-[#16a085]"
                        style={{ width: `${(count / specMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-400">No data yet</p>
              </div>
            )}
          </div>

          {/* Top Doctors */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Award size={18} className="text-amber-500" />
              <h3 className="font-semibold text-slate-900">Top Performing Doctors</h3>
            </div>
            {topDocs.length > 0 ? (
              <div className="space-y-1">
                {topDocs.map((doc, i) => (
                  <div key={doc.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${medals[i]}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.specialty}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-[#0f3460]">{doc.count} appts</p>
                      <p className="text-xs text-[#16a085] font-medium">${doc.rev.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Stethoscope size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-400">No appointment data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Empty state banner */}
        {appts.length === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100 rounded-2xl p-6 text-center">
            <Calendar size={32} className="text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-blue-700">No appointments yet</p>
            <p className="text-xs text-blue-500 mt-1">Charts will populate as bookings are made. Run <code className="bg-blue-100 px-1 rounded">admin-setup.sql</code> in Supabase if features are missing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
