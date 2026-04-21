import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getTimeSlots } from '@/lib/data';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('*, doctor:doctors(*)')
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointments: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const { doctor_id, patient_phone, appointment_date, time_slot, location } = body;

  // Validate required fields
  const fields: Record<string, string> = {};
  if (!doctor_id) fields.doctor_id = 'Doctor is required';
  if (!patient_phone?.trim()) fields.patient_phone = 'Phone number is required';
  if (!appointment_date) fields.appointment_date = 'Date is required';
  if (!time_slot) fields.time_slot = 'Time slot is required';
  if (!location) fields.location = 'Location is required';

  // Validate date is not Sunday and within 30 days
  if (appointment_date) {
    const date = new Date(appointment_date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    if (date.getDay() === 0) {
      fields.appointment_date = 'Appointments are not available on Sundays';
    } else if (date <= today) {
      fields.appointment_date = 'Date must be in the future';
    } else if (date > maxDate) {
      fields.appointment_date = 'Date must be within 30 days';
    }

    // Validate time slot
    if (time_slot) {
      const validSlots = getTimeSlots(appointment_date);
      if (!validSlots.includes(time_slot)) {
        fields.time_slot = 'Invalid time slot for selected date';
      }
    }
  }

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Validation failed', fields }, { status: 400 });
  }

  // Verify doctor exists
  const service = createServiceClient();
  const { data: doctor } = await service.from('doctors').select('id').eq('id', doctor_id).single();
  if (!doctor) {
    return NextResponse.json({ error: 'DOCTOR_NOT_FOUND', message: 'Doctor not found' }, { status: 404 });
  }

  const { data, error } = await service.from('appointments').insert({
    user_id: user.id,
    doctor_id,
    patient_name: (user.user_metadata?.full_name as string) || user.email,
    patient_email: user.email,
    patient_phone: patient_phone.trim(),
    appointment_date,
    time_slot,
    location,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointment: data }, { status: 201 });
}
