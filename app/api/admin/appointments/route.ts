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
    // Fetch all doctors once for lookup
    const doctorsSnap = await adminDb.collection('doctors').get();
    const doctorMap: Record<string, { name: string; specialty: string; avatarColor: string }> = {};
    doctorsSnap.docs.forEach(d => {
      const data = d.data();
      doctorMap[d.id] = {
        name: data.name ?? 'Unknown Doctor',
        specialty: data.specialty ?? '',
        avatarColor: data.avatarColor ?? data.avatar_color ?? '#0f3460',
      };
    });

    const snap = await adminDb.collection('appointments').get();

    let appointments = snap.docs.map(d => {
      const data = d.data();

      // Handle both web format (doctorId, doctorName) and mobile format (doctor_id, no doctorName)
      const doctorId = data.doctorId ?? data.doctor_id ?? '';
      const doctorInfo = doctorMap[doctorId];

      const doctorName = data.doctorName ?? doctorInfo?.name ?? 'Unknown';
      const doctorSpecialty = data.doctorSpecialty ?? doctorInfo?.specialty ?? '';
      const doctorAvatarColor = data.doctorAvatarColor ?? doctorInfo?.avatarColor ?? '#0f3460';

      // Handle both web format (userId, patientName) and mobile format (user_id, patient_name)
      const userId = data.userId ?? data.user_id ?? '';
      const patientName = data.patientName ?? data.patient_name ?? '';
      const patientEmail = data.patientEmail ?? data.patient_email ?? '';
      const patientPhone = data.patientPhone ?? data.patient_phone ?? '';
      const appointmentDate = data.appointmentDate ?? data.appointment_date ?? '';
      const timeSlot = data.timeSlot ?? data.time_slot ?? '';

      return {
        id: d.id,
        user_id: userId,
        doctor_id: doctorId,
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone,
        appointment_date: appointmentDate,
        time_slot: timeSlot,
        location: data.location ?? '',
        status: data.status ?? 'confirmed',
        created_at: data.createdAt?.toDate?.()?.toISOString()
          ?? data.created_at
          ?? new Date().toISOString(),
        doctor: {
          id: doctorId,
          name: doctorName,
          specialty: doctorSpecialty,
          bio: null,
          location: data.location ?? '',
          avatar_color: doctorAvatarColor,
        },
      };
    });

    // Sort by date descending
    appointments.sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

    if (statusFilter) appointments = appointments.filter(a => a.status === statusFilter);
    if (locationFilter) appointments = appointments.filter(a => a.location === locationFilter);

    return NextResponse.json({ appointments });
  } catch (err) {
    return NextResponse.json({ error: 'DB_ERROR', message: String(err) }, { status: 500 });
  }
}