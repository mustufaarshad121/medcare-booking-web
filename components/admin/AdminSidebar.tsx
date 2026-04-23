'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3, Calendar, Users, Stethoscope,
  Bell, Settings, Shield, LogOut, ChevronRight, Heart,
} from 'lucide-react';

const NAV = [
  { href: '/admin',               label: 'Analytics',      icon: BarChart3,    exact: true },
  { href: '/admin/appointments',  label: 'Appointments',   icon: Calendar },
  { href: '/admin/doctors',       label: 'Doctors',        icon: Stethoscope },
  { href: '/admin/users',         label: 'Users',          icon: Users },
  { href: '/admin/notifications', label: 'Notifications',  icon: Bell },
  { href: '/admin/settings',      label: 'Settings',       icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  function active(item: typeof NAV[0]) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0f3460] flex flex-col min-h-full shadow-2xl">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#16a085] rounded-xl flex items-center justify-center shadow-lg">
            <Heart size={17} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MedCare</p>
            <p className="text-[#16a085] text-xs font-semibold tracking-wide">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Navigation label */}
      <div className="px-5 pt-5 pb-1">
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">Menu</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV.map(item => {
          const on  = active(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                on
                  ? 'bg-[#16a085] text-white shadow-lg shadow-[#16a085]/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {on && <ChevronRight size={14} className="opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <div className="px-3 py-2">
          <p className="text-white/40 text-xs">Signed in as</p>
          <p className="text-white/80 text-xs font-semibold truncate">Admin</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
