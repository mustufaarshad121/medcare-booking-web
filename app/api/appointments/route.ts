import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyUser } from '@/lib/verify-auth';
import { getTimeSlots } from '@/lib/data';

export async function GET(request: NextRequest) {
  const decoded = await verifyUser(request);
  if (!decoded) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 });
  }

  try {
    const snap = await adminDb.collection('appointments')
      .where('userId', '==', decoded.uid)
      .get();

    const appointments = snap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          user_id: data.userId,
          doctor_id: data.doctorId,
          patient_name: data.patientName,
          patient_email: data.patientEmail,
          patient_phone: data.patientPhone,
          appointment_date: data.appointmentDate,
          time_slot: data.timeSlot,
          location: data.location,
          status: data.status,
          created_at: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          doctor: {
            id: data.doctorId,
            name: data.doctorName ?? '',
            specialty: data.doctorSpecialty ?? '',
            bio: null,
            location: data.location,
            avatar_color: data.doctorAvatarColor ?? '#0f3460',
          },
        };
      })
      .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

    return NextResponse.json({ appointments });
  } catch (err) {
    return NextResponse.json({ error: 'DB_ERROR', message: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const decoded = await verifyUser(request);
  if (!decoded) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const { doctor_id, patient_phone, appointment_date, time_slot, location } = body;

  const fields: Record<string, string> = {};
  if (!doctor_id) fields.doctor_id = 'Doctor is required';
  if (!patient_phone?.trim()) fields.patient_phone = 'Phone number is required';
  if (!appointment_date) fields.appointment_date = 'Date is required';
  if (!time_slot) fields.time_slot = 'Time slot is required';
  if (!location) fields.location = 'Location is required';

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

    if (time_slot && !getTimeSlots(appointment_date).includes(time_slot)) {
      fields.time_slot = 'Invalid time slot for selected date';
    }
  }

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Validation failed', fields }, { status: 400 });
  }

  try {
    const doctorDoc = await adminDb.collection('doctors').doc(doctor_id).get();
    if (!doctorDoc.exists) {
      return NextResponse.json({ error: 'DOCTOR_NOT_FOUND', message: 'Doctor not found' }, { status: 404 });
    }
    const doctorData = doctorDoc.data()!;

    const ref = adminDb.collection('appointments').doc();
    const now = new Date();
    await ref.set({
      userId: decoded.uid,
      doctorId: doctor_id,
      doctorName: doctorData.name ?? '',
      doctorSpecialty: doctorData.specialty ?? '',
      doctorAvatarColor: doctorData.avatarColor ?? doctorData.avatar_color ?? '#0f3460',
      doctorLocation: doctorData.location ?? location,
      patientName: decoded.name ?? decoded.email ?? '',
      patientEmail: decoded.email ?? '',
      patientPhone: patient_phone.trim(),
      appointmentDate: appointment_date,
      timeSlot: time_slot,
      location,
      status: 'confirmed',
      createdAt: now,
    });

    return NextResponse.json({
      appointment: {
        id: ref.id,
        user_id: decoded.uid,
        doctor_id,
        appointment_date,
        time_slot,
        location,
        status: 'confirmed',
        created_at: now.toISOString(),
      },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'DB_ERROR', message: String(err) }, { status: 500 });
  }
}
