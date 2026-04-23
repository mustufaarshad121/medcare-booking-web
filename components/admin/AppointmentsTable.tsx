'use client';

import { useState } from 'react';
import type { Appointment, AppointmentStatus, ClinicCity } from '@/lib/types';
import { formatDate } from '@/lib/data';
import { CLINIC_LOCATIONS } from '@/lib/data';
import { Filter, CheckCircle, XCircle } from 'lucide-react';

export default function AppointmentsTable({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [statusFilter,   setStatusFilter]   = useState<AppointmentStatus | ''>('');
  const [locationFilter, setLocationFilter] = useState<ClinicCity | ''>('');
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = appointments.filter(a => {
    if (statusFilter   && a.status   !== statusFilter)   return false;
    if (locationFilter && a.location !== locationFilter) return false;
    return true;
  });

  async function handleStatusChange(id: string, newStatus: AppointmentStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      }
    } finally { setUpdating(null); }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter size={14} />
          <span className="font-medium">Filter:</span>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as AppointmentStatus | '')}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085] bg-white text-gray-700">
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value as ClinicCity | '')}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085] bg-white text-gray-700">
          <option value="">All Locations</option>
          {CLINIC_LOCATIONS.map(l => <option key={l.city} value={l.city}>{l.city}</option>)}
        </select>
        <span className="text-sm text-gray-400 sm:ml-auto">
          {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#0f3460]">
                {['Patient', 'Doctor', 'Specialty', 'Date & Time', 'Location', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-white/80 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle size={28} className="opacity-30" />
                      <p className="text-sm">No appointments found.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((a, i) => (
                <tr key={a.id} className={`hover:bg-gray-50/80 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#0f3460] text-sm">{a.patient_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.patient_email}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">{a.doctor?.name}</td>
                  <td className="px-5 py-4">
                    <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {a.doctor?.specialty}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800 text-sm">{formatDate(a.appointment_date)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time_slot}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-sm">{a.location}</td>
                  <td className="px-5 py-4">
                    <select value={a.status}
                      onChange={e => handleStatusChange(a.id, e.target.value as AppointmentStatus)}
                      disabled={updating === a.id}
                      className={`border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a085] disabled:opacity-50 cursor-pointer transition-colors ${
                        a.status === 'confirmed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-600 border-red-200'}`}>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
