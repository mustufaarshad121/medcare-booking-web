import { adminDb } from '@/lib/firebase-admin';
import BookingForm from '@/components/booking/BookingForm';
import AuthGuard from '@/components/auth/AuthGuard';
import type { Doctor } from '@/lib/types';

export const metadata = { title: 'Book Appointment — MedCare Health' };

export default async function BookPage() {
  let doctors: Doctor[] = [];
  try {
    const snap = await adminDb.collection('doctors').orderBy('specialty').get();
    doctors = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        specialty: data.specialty,
        bio: data.bio ?? null,
        location: data.location,
        avatar_color: data.avatarColor ?? data.avatar_color ?? '#0f3460',
      } as Doctor;
    });
  } catch {}

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f3460]">Book an Appointment</h1>
          <p className="text-[#64748b] mt-2">
            Select a specialist, choose your preferred time, and confirm your booking.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <BookingForm doctors={doctors} />
        </div>
      </div>
    </AuthGuard>
  );
}
