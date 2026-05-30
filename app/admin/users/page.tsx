import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth'
import { adminDb } from '@/lib/firebase-admin'
import UsersManager from '@/components/admin/UsersManager'
import type { UserProfile } from '@/lib/types'

export const metadata = { title: 'Users — MedCare Admin' }

export default async function UsersPage() {
  const cookieStore = await cookies()
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login')

  let profiles: UserProfile[] = []

  try {
    const snap = await adminDb.collection('users').orderBy('createdAt', 'desc').get()
    profiles = snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        email: data.email ?? null,
        full_name: data.fullName ?? null,
        phone: data.phone ?? null,
        created_at: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      } as UserProfile
    })
  } catch {}

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <div className="bg-[#0f3460] px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">User Management</h1>
        <p className="text-sm text-white/60 mt-0.5">{profiles.length} registered users</p>
      </div>
      <div className="p-8">
        <UsersManager initialProfiles={profiles} />
      </div>
    </div>
  )
}
