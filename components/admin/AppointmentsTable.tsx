'use client';

import { useState } from 'react';
import type { Appointment, AppointmentStatus, ClinicCity } from '@/lib/types';
import { formatDate } from '@/lib/data';
import Badge from '@/components/ui/Badge';
import { CLINIC_LOCATIONS } from '@/lib/data';

interface AppointmentsTableProps {
  initialAppointments: Appointment[];
}

export default function AppointmentsTable({ initialAppointments }: AppointmentsTableProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [locationFilter, setLocationFilter] = useState<ClinicCity | ''>('');
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = appointments.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (locationFilter && a.location !== locationFilter) return false;
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | '')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085]"
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value as ClinicCity | '')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085]"
        >
          <option value="">All Locations</option>
          {CLINIC_LOCATIONS.map((l) => (
            <option key={l.city} value={l.city}>{l.city}</option>
          ))}
        </select>
        <span className="text-sm text-[#64748b] self-center">
          {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table — scrollable on mobile */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#0f3460] text-white">
              <th className="text-left px-4 py-3 font-semibold">Patient</th>
              <th className="text-left px-4 py-3 font-semibold">Doctor</th>
              <th className="text-left px-4 py-3 font-semibold">Specialty</th>
              <th className="text-left px-4 py-3 font-semibold">Date & Time</th>
              <th className="text-left px-4 py-3 font-semibold">Location</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-[#64748b] bg-white">
                  No appointments found.
                </td>
              </tr>
            ) : (
              filtered.map((a, i) => (
                <tr
                  key={a.id}
                  className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0f3460]">{a.patient_name}</p>
                    <p className="text-xs text-[#64748b]">{a.patient_email}</p>
                  </td>
                  <td className="px-4 py-3 text-[#1a202c]">{a.doctor?.name}</td>
                  <td className="px-4 py-3 text-[#64748b]">{a.doctor?.specialty}</td>
                  <td className="px-4 py-3">
                    <p className="text-[#1a202c]">{formatDate(a.appointment_date)}</p>
                    <p className="text-xs text-[#64748b]">{a.time_slot}</p>
                  </td>
                  <td className="px-4 py-3 text-[#64748b]">{a.location}</td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value as AppointmentStatus)}
                      disabled={updating === a.id}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#16a085] disabled:opacity-50"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
