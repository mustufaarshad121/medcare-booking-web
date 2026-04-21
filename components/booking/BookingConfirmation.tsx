import Link from 'next/link';
import { CheckCircle, Calendar, Clock, MapPin, User } from 'lucide-react';
import type { Doctor } from '@/lib/types';
import { formatDate, getInitials } from '@/lib/data';
import Button from '@/components/ui/Button';

interface BookingConfirmationProps {
  doctor: Doctor;
  date: string;
  timeSlot: string;
  location: string;
}

export default function BookingConfirmation({
  doctor,
  date,
  timeSlot,
  location,
}: BookingConfirmationProps) {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="flex justify-center mb-4">
        <CheckCircle className="text-[#059669]" size={64} />
      </div>
      <h2 className="text-2xl font-bold text-[#0f3460] mb-2">Appointment Confirmed!</h2>
      <p className="text-[#64748b] mb-8">
        Your appointment has been successfully booked. See you soon!
      </p>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-left space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{ backgroundColor: doctor.avatar_color }}
          >
            {getInitials(doctor.name)}
          </div>
          <div>
            <p className="font-semibold text-[#0f3460] text-sm">{doctor.name}</p>
            <p className="text-[#16a085] text-xs">{doctor.specialty}</p>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-[#1a202c]">
            <Calendar size={16} className="text-[#16a085] shrink-0" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#1a202c]">
            <Clock size={16} className="text-[#16a085] shrink-0" />
            <span>{timeSlot}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#1a202c]">
            <MapPin size={16} className="text-[#16a085] shrink-0" />
            <span>MedCare Health — {location}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/bookings">
          <Button variant="primary" size="lg" className="w-full sm:w-auto">
            View My Bookings
          </Button>
        </Link>
        <Link href="/book">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            Book Another
          </Button>
        </Link>
      </div>
    </div>
  );
}
