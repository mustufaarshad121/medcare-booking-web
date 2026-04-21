'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Appointment } from '@/lib/types';
import { formatDate, getInitials } from '@/lib/data';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CancelModal from './CancelModal';

interface BookingCardProps {
  appointment: Appointment;
  onCancelled: (id: string) => void;
}

export default function BookingCard({ appointment, onCancelled }: BookingCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) {
        onCancelled(appointment.id);
      }
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  const doctor = appointment.doctor;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {doctor && (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: doctor.avatar_color }}
          >
            {getInitials(doctor.name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold text-[#0f3460] text-sm">
              {doctor?.name ?? 'Unknown Doctor'}
            </p>
            <Badge status={appointment.status} />
          </div>
          <p className="text-[#16a085] text-xs font-medium mb-2">{doctor?.specialty}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748b]">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(appointment.appointment_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {appointment.time_slot}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {appointment.location}
            </span>
          </div>
        </div>

        {appointment.status === 'confirmed' && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="shrink-0"
          >
            Cancel
          </Button>
        )}
      </div>

      {modalOpen && (
        <CancelModal
          appointment={appointment}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleCancel}
          loading={loading}
        />
      )}
    </>
  );
}
