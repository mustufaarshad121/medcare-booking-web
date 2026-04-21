import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BookingsList from '@/components/bookings/BookingsList';

export const metadata = { title: 'My Appointments — MedCare Health' };

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f3460]">My Appointments</h1>
        <p className="text-[#64748b] mt-2">
          Manage your upcoming and past appointments.
        </p>
      </div>
      <BookingsList />
    </div>
  );
}
