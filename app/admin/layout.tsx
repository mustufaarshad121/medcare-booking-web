import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isAuth = cookieStore.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_VALUE

  if (!isAuth) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  )
}
