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
    // Fetch both web format (userId) and mobile format (user_id)
    const [snap1, snap2] = await Promise.all([
      adminDb.collection('appointments').where('userId', '==', decoded.uid).get(),
      adminDb.collection('appointments').where('user_id', '==', decoded.uid).get(),
    ]);

    // Fetch all doctors for lookup
    const doctorsSnap = await adminDb.collection('doctors').get();
    const doctorMap: Record<string, { name: string; specialty: string; avatarColor: string }> = {};
    doctorsSnap.docs.forEach(d => {
      const data = d.data();
      doctorMap[d.id] = {
        name: data.name ?? '',
        specialty: data.specialty ?? '',
        avatarColor: data.avatarColor ?? data.avatar_color ?? '#0f3460',
      };
    });

    // Merge and deduplicate
    const allDocs = [...snap1.docs];
    const existingIds = new Set(snap1.docs.map(d => d.id));
    snap2.docs.forEach(d => {
      if (!existingIds.has(d.id)) allDocs.push(d);
    });

    const appointments = allDocs.map(d => {
      const data = d.data();

      const doctorId = data.doctorId ?? data.doctor_id ?? '';
      const doctorInfo = doctorMap[doctorId];
      const doctorName = data.doctorName ?? data.doctor_name ?? doctorInfo?.name ?? 'Unknown Doctor';
      const doctorSpecialty = data.doctorSpecialty ?? data.doctor_specialty ?? doctorInfo?.specialty ?? '';
      const doctorAvatarColor = data.doctorAvatarColor ?? doctorInfo?.avatarColor ?? '#0f3460';

      return {
        id: d.id,
        user_id: data.userId ?? data.user_id ?? '',
        doctor_id: doctorId,
        patient_name: data.patientName ?? data.patient_name ?? '',
        patient_email: data.patientEmail ?? data.patient_email ?? '',
        patient_phone: data.patientPhone ?? data.patient_phone ?? '',
        appointment_date: data.appointmentDate ?? data.appointment_date ?? '',
        time_slot: data.timeSlot ?? data.time_slot ?? '',
        location: data.location ?? '',
        status: data.status ?? 'confirmed',
        created_at: data.createdAt?.toDate?.()?.toISOString() ?? data.created_at ?? new Date().toISOString(),
        doctor: {
          id: doctorId,
          name: doctorName,
          specialty: doctorSpecialty,
          bio: null,
          location: data.location ?? '',
          avatar_color: doctorAvatarColor,
        },
      };
    }).sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

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

    // Save in both formats for compatibility
    await ref.set({
      // Web format (camelCase)
      userId: decoded.uid,
      doctorId: doctor_id,
      doctorName: doctorData.name ?? '',
      doctorSpecialty: doctorData.specialty ?? '',
      doctorAvatarColor: doctorData.avatarColor ?? doctorData.avatar_color ?? '#0f3460',
      patientName: decoded.name ?? decoded.email ?? '',
      patientEmail: decoded.email ?? '',
      patientPhone: patient_phone.trim(),
      appointmentDate: appointment_date,
      timeSlot: time_slot,
      // Mobile format (snake_case) — saved alongside for cross-app compatibility
      user_id: decoded.uid,
      doctor_id: doctor_id,
      doctor_name: doctorData.name ?? '',
      doctor_specialty: doctorData.specialty ?? '',
      patient_name: decoded.name ?? decoded.email ?? '',
      patient_email: decoded.email ?? '',
      patient_phone: patient_phone.trim(),
      appointment_date: appointment_date,
      time_slot: time_slot,
      location,
      status: 'confirmed',
      createdAt: now,
      created_at: now.toISOString(),
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