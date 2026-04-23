'use client';

import { useState, useEffect } from 'react';
import { Search, X, Ban, Unlock, List, Users, Calendar, ChevronLeft, AlertTriangle } from 'lucide-react';
import type { UserProfile, Appointment } from '@/lib/types';
import { formatDate } from '@/lib/data';

/* ─── Avatar ────────────────────────────────────────────────────────────── */
function Avatar({ name, blocked }: { name: string; blocked: boolean }) {
  const ini = (name || '?').replace('Dr. ', '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${blocked ? 'bg-slate-400' : 'bg-[#0f3460]'}`}>
      {ini}
    </div>
  );
}

/* ─── Booking History Modal ─────────────────────────────────────────────── */
function BookingModal({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  const [appts, setAppts]     = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  /* ✅ Correct: useEffect (not useState) for data fetching */
  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/admin/users/${user.id}/appointments`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => setAppts(d.appointments ?? []))
      .catch(() => setError('Could not load appointments.'))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm truncate">{user.full_name ?? user.email ?? 'User'}</h3>
            <p className="text-xs text-slate-400">Booking History</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full">
            {appts.length} booking{appts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#16a085] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading…</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle size={28} className="mx-auto mb-2 text-amber-400" />
              <p className="text-sm text-slate-500">{error}</p>
            </div>
          ) : appts.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-400">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appts.map(a => (
                <div key={a.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-slate-900 truncate flex-1 mr-2">
                      {a.doctor?.name ?? 'Unknown Doctor'}
                    </p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                      a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{a.doctor?.specialty} · {formatDate(a.appointment_date)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.time_slot} · {a.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function UsersManager({ initialProfiles }: { initialProfiles: UserProfile[] }) {
  const [profiles, setProfiles]     = useState<UserProfile[]>(initialProfiles);
  const [search, setSearch]         = useState('');
  const [history, setHistory]       = useState<UserProfile | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  /* ─── Migration notice ─────────────────────────────────────────────── */
  if (initialProfiles.length === 0) {
    return (
      <div className="max-w-xl">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle size={22} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Profiles table not configured</p>
            <p className="text-sm text-amber-700">
              Run <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">admin-setup.sql</code> in your Supabase SQL editor to enable user management, then refresh this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    return (p.full_name ?? '').toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q);
  });

  async function handleBlock(p: UserProfile) {
    const action = p.is_blocked ? 'Unblock' : 'Block';
    if (!confirm(`${action} ${p.full_name ?? p.email ?? 'this user'}?`)) return;
    setTogglingId(p.id);
    try {
      const res = await fetch(`/api/admin/users/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_blocked: !p.is_blocked }),
      });
      if (!res.ok) throw new Error();
      setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, is_blocked: !p.is_blocked } : x));
    } catch { alert('Action failed'); }
    finally { setTogglingId(null); }
  }

  const active  = profiles.filter(p => !p.is_blocked && !p.is_admin).length;
  const blocked = profiles.filter(p => p.is_blocked).length;

  return (
    <div>
      {/* Summary strip */}
      <div className="flex gap-4 mb-6">
        {[
          { label: 'Total',   value: profiles.length, color: 'text-slate-700' },
          { label: 'Active',  value: active,           color: 'text-green-600' },
          { label: 'Blocked', value: blocked,          color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 mb-5 shadow-sm max-w-sm">
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder-slate-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0f3460]">
              {['User', 'Email', 'Bookings', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-white/70 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-14 text-slate-400">
                  <Users size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{search ? 'No users match your search.' : 'No users found.'}</p>
                </td>
              </tr>
            ) : filtered.map(p => (
              <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${p.is_blocked ? 'opacity-70' : ''}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.full_name ?? p.email ?? '?'} blocked={p.is_blocked} />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm leading-tight">{p.full_name ?? '—'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.is_admin ? 'Administrator' : 'Patient'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-600 text-sm">{p.email ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Calendar size={13} className="text-[#16a085]" />
                    <span className="font-semibold text-slate-900">{p.appointment_count ?? 0}</span>
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {p.is_admin
                    ? <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">Admin</span>
                    : p.is_blocked
                    ? <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">Blocked</span>
                    : <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Active</span>
                  }
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHistory(p)}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <List size={12} /> History
                    </button>
                    {!p.is_admin && (
                      <button
                        onClick={() => handleBlock(p)}
                        disabled={togglingId === p.id}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          p.is_blocked
                            ? 'text-green-700 hover:bg-green-50'
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        {p.is_blocked ? <><Unlock size={12} />Unblock</> : <><Ban size={12} />Block</>}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history && <BookingModal user={history} onClose={() => setHistory(null)} />}
    </div>
  );
}
