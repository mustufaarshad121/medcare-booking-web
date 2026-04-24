'use client';

import { useState } from 'react';
import { Search, X, Users } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

export default function UsersManager({ initialProfiles }: { initialProfiles: UserProfile[] }) {
  const [search, setSearch] = useState('');

  const filtered = initialProfiles.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.full_name ?? '').toLowerCase().includes(q) ||
      (p.email ?? '').toLowerCase().includes(q) ||
      (p.phone ?? '').toLowerCase().includes(q)
    );
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-2 bg-[#16213e] border border-slate-700 rounded-xl px-4 py-2.5 mb-5 max-w-sm">
        <Search size={15} className="text-slate-500 flex-shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="flex-1 text-sm outline-none bg-transparent text-slate-200 placeholder-slate-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-500 hover:text-slate-300">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#16213e] rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0f3460]">
              {['Name', 'Email', 'Phone', 'Joined'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-white/70 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-14 text-slate-500">
                  <Users size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{search ? 'No users match your search.' : 'No users found.'}</p>
                </td>
              </tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-white text-sm">{p.full_name ?? '—'}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{p.id.slice(0, 8)}…</p>
                </td>
                <td className="px-5 py-3.5 text-slate-300 text-sm">{p.email ?? '—'}</td>
                <td className="px-5 py-3.5 text-slate-300 text-sm">{p.phone ?? '—'}</td>
                <td className="px-5 py-3.5 text-slate-400 text-sm">{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
