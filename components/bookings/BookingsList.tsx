'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Appointment } from '@/lib/types';
import BookingCard from './BookingCard';
import Button from '@/components/ui/Button';
import { CalendarPlus } from 'lucide-react';

export default function BookingsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((d) => setAppointments(d.appointments ?? []))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancelled = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a))
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarPlus className="mx-auto text-[#64748b] mb-4" size={48} />
        <h3 className="text-lg font-semibold text-[#0f3460] mb-2">No appointments yet</h3>
        <p className="text-[#64748b] mb-6 text-sm">
          You haven&apos;t booked any appointments. Get started by booking with one of our specialists.
        </p>
        <Link href="/book">
          <Button size="lg">Book Your First Appointment</Button>
        </Link>
      </div>
    );
  }

  const confirmed = appointments.filter((a) => a.status === 'confirmed');
  const cancelled = appointments.filter((a) => a.status === 'cancelled');

  return (
    <div className="space-y-6">
      {confirmed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">
            Upcoming ({confirmed.length})
          </h2>
          <div className="space-y-3">
            {confirmed.map((a) => (
              <BookingCard key={a.id} appointment={a} onCancelled={handleCancelled} />
            ))}
          </div>
        </div>
      )}

      {cancelled.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">
            Cancelled ({cancelled.length})
          </h2>
          <div className="space-y-3">
            {cancelled.map((a) => (
              <BookingCard key={a.id} appointment={a} onCancelled={handleCancelled} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
