import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (request.cookies.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const snap = await adminDb.collection('appointments')
      .where('userId', '==', id)
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
            avatar_color: data.doctorAvatarColor ?? '#0f3460',
          },
        };
      })
      .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

    return NextResponse.json({ appointments });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
