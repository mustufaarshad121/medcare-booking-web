import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import BookingForm from '@/components/booking/BookingForm';
import type { Doctor } from '@/lib/types';

export const metadata = { title: 'Book Appointment — MedCare Health' };

export default async function BookPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const service = createServiceClient();
  const { data: doctors } = await service
    .from('doctors')
    .select('*')
    .order('specialty');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f3460]">Book an Appointment</h1>
        <p className="text-[#64748b] mt-2">
          Select a specialist, choose your preferred time, and confirm your booking.
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <BookingForm doctors={(doctors as Doctor[]) ?? []} />
      </div>
    </div>
  );
}
