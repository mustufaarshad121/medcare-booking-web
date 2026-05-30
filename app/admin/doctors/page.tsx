import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth'
import { adminDb } from '@/lib/firebase-admin'
import DoctorsManager from '@/components/admin/DoctorsManager'
import type { DoctorWithFee } from '@/lib/types'
import { Stethoscope, CheckCircle } from 'lucide-react'

export const metadata = { title: 'Doctors — MedCare Admin' }

export default async function DoctorsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login')

  let doctors: DoctorWithFee[] = []

  try {
    const snap = await adminDb.collection('doctors').orderBy('specialty').get()
    doctors = snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name,
        specialty: data.specialty,
        bio: data.bio ?? null,
        consultation_fee: data.consultationFee ?? data.consultation_fee ?? 150,
        is_available: data.isAvailable ?? data.is_available ?? true,
        experience_years: data.experienceYears ?? data.experience_years ?? null,
        location: data.location ?? null,
      } as DoctorWithFee
    })
  } catch {}

  const available = doctors.filter(d => d.is_available).length

  return (
    <div>
      <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-900">Doctor Management</h1>
        <div className="flex items-center gap-5 mt-1.5">
          <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
            <Stethoscope size={14} />
            {doctors.length} total
          </span>
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
            <CheckCircle size={14} />
            {available} available
          </span>
        </div>
      </div>
      <div className="p-8">
        <DoctorsManager initialDoctors={doctors} />
      </div>
    </div>
  )
}
