import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (request.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Admin authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const locationFilter = searchParams.get('location');

  try {
    const snap = await adminDb.collection('appointments').orderBy('appointmentDate', 'desc').get();
    let appointments = snap.docs.map(d => {
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
    });

    if (statusFilter) appointments = appointments.filter(a => a.status === statusFilter);
    if (locationFilter) appointments = appointments.filter(a => a.location === locationFilter);

    return NextResponse.json({ appointments });
  } catch (err) {
    return NextResponse.json({ error: 'DB_ERROR', message: String(err) }, { status: 500 });
  }
}
