import { supabase } from './supabase';
import type {
  Appointment,
  AnalyticsData,
  DayCount,
  SpecialtyCount,
  DayRevenue,
  DoctorPerformance,
  DoctorWithFee,
  Profile,
  NotificationLog,
} from '../types';

interface RawAppointmentRow {
  id: string;
  status: string;
  appointment_date: string;
  doctor_id: string;
  user_id: string;
  doctor: { name: string; specialty: string; consultation_fee: number } | null;
}

// ── Analytics ──────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<AnalyticsData> {
  const today = new Date();

  const [apptResult, docResult, userResult] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, status, appointment_date, doctor_id, user_id, doctor:doctors(name, specialty, consultation_fee)'),
    supabase.from('doctors').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  if (apptResult.error) throw apptResult.error;
  if (docResult.error) throw docResult.error;
  if (userResult.error) throw userResult.error;

  const appointments = (apptResult.data ?? []) as unknown as RawAppointmentRow[];
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const cancelled = appointments.filter(a => a.status === 'cancelled');

  const totalRevenue = confirmed.reduce(
    (sum, a) => sum + (a.doctor?.consultation_fee ?? 0),
    0
  );

  const dayMap: Record<string, number> = {};
  const revMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dayMap[key] = 0;
    revMap[key] = 0;
  }

  appointments.forEach(a => {
    if (a.appointment_date in dayMap) {
      dayMap[a.appointment_date]++;
      if (a.status === 'confirmed') {
        revMap[a.appointment_date] += a.doctor?.consultation_fee ?? 0;
      }
    }
  });

  const appointmentsByDay: DayCount[] = Object.entries(dayMap).map(
    ([date, count]) => ({ date, count })
  );
  const revenueByDay: DayRevenue[] = Object.entries(revMap).map(
    ([date, revenue]) => ({ date, revenue })
  );

  const specialtyMap: Record<string, number> = {};
  appointments.forEach(a => {
    const spec = a.doctor?.specialty ?? 'Unknown';
    specialtyMap[spec] = (specialtyMap[spec] ?? 0) + 1;
  });
  const appointmentsBySpecialty: SpecialtyCount[] = Object.entries(specialtyMap)
    .map(([specialty, count]) => ({ specialty, count }))
    .sort((a, b) => b.count - a.count);

  const doctorMap: Record<
    string,
    { name: string; specialty: string; count: number; revenue: number }
  > = {};
  appointments.forEach(a => {
    if (!a.doctor_id) return;
    if (!doctorMap[a.doctor_id]) {
      doctorMap[a.doctor_id] = {
        name: a.doctor?.name ?? 'Unknown',
        specialty: a.doctor?.specialty ?? '',
        count: 0,
        revenue: 0,
      };
    }
    doctorMap[a.doctor_id].count++;
    if (a.status === 'confirmed') {
      doctorMap[a.doctor_id].revenue += a.doctor?.consultation_fee ?? 0;
    }
  });

  const topDoctors: DoctorPerformance[] = Object.entries(doctorMap)
    .map(([doctor_id, d]) => ({
      doctor_id,
      doctor_name: d.name,
      specialty: d.specialty,
      count: d.count,
      revenue: d.revenue,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalAppointments: appointments.length,
    confirmedAppointments: confirmed.length,
    cancelledAppointments: cancelled.length,
    totalDoctors: docResult.count ?? 0,
    totalUsers: userResult.count ?? 0,
    totalRevenue,
    appointmentsByDay,
    appointmentsBySpecialty,
    revenueByDay,
    topDoctors,
  };
}

// ── Doctor Management ──────────────────────────────────────────────────────

export async function getAllDoctors(): Promise<DoctorWithFee[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('specialty');
  if (error) throw error;
  return (data ?? []) as DoctorWithFee[];
}

export interface DoctorUpsert {
  name: string;
  specialty: string;
  location: string;
  bio: string;
  avatar_color: string;
  consultation_fee: number;
  is_available: boolean;
}

export async function createDoctor(payload: DoctorUpsert): Promise<void> {
  const { error } = await supabase.from('doctors').insert(payload);
  if (error) throw error;
}

export async function updateDoctor(
  id: string,
  payload: Partial<DoctorUpsert>
): Promise<void> {
  const { error } = await supabase.from('doctors').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteDoctor(id: string): Promise<void> {
  const { error } = await supabase.from('doctors').delete().eq('id', id);
  if (error) throw error;
}

// ── User Management ────────────────────────────────────────────────────────

export async function getAllProfiles(): Promise<Profile[]> {
  const [profilesResult, apptResult] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('appointments').select('user_id'),
  ]);

  if (profilesResult.error) throw profilesResult.error;

  const countMap: Record<string, number> = {};
  (apptResult.data ?? []).forEach(a => {
    countMap[a.user_id] = (countMap[a.user_id] ?? 0) + 1;
  });

  return (profilesResult.data ?? []).map(p => ({
    ...p,
    appointment_count: countMap[p.id] ?? 0,
  })) as Profile[];
}

export async function getUserAppointments(userId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, doctor:doctors(name, specialty, avatar_color)')
    .eq('user_id', userId)
    .order('appointment_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function toggleBlockUser(userId: string, block: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', userId);
  if (error) throw error;
}

// ── Notification Logs ──────────────────────────────────────────────────────

export async function getNotificationLogs(): Promise<NotificationLog[]> {
  const { data, error } = await supabase
    .from('notification_logs')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as NotificationLog[];
}

export async function logNotification(params: {
  title: string;
  body: string;
  target: string;
  sentBy: string;
}): Promise<void> {
  const { error } = await supabase.from('notification_logs').insert({
    title: params.title,
    body: params.body,
    target: params.target,
    sent_by: params.sentBy,
  });
  if (error) throw error;
}

// ── App Settings ───────────────────────────────────────────────────────────

export async function getAppSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('app_settings').select('*');
  if (error) throw error;
  const map: Record<string, string> = {};
  (data ?? []).forEach((s: { key: string; value: string }) => {
    map[s.key] = s.value;
  });
  return map;
}

export async function updateAppSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
