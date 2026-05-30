import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth'
import { adminDb } from '@/lib/firebase-admin'
import NotificationCompose from '@/components/admin/NotificationCompose'

export const metadata = { title: 'Notifications — MedCare Admin' }

export default async function NotificationsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== ADMIN_SESSION_VALUE) redirect('/admin/login')

  let notifications: unknown[] = []
  try {
    const snap = await adminDb.collection('notifications').orderBy('createdAt', 'desc').limit(50).get()
    notifications = snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        message: data.message,
        type: data.type ?? 'info',
        target: data.target ?? 'all',
        sent_by: data.sentBy ?? 'admin',
        created_at: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      }
    })
  } catch {}

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <div className="bg-[#0f3460] px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-white/60 mt-0.5">Compose and manage notifications</p>
      </div>
      <div className="p-8">
        <NotificationCompose initialNotifications={notifications as never[]} />
      </div>
    </div>
  )
}
