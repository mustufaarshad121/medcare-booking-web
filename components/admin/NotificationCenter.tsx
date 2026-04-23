'use client';

import { useState } from 'react';
import { Send, Bell, Users, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import type { NotificationLog } from '@/lib/types';

const TEMPLATES = [
  { label: '🎉 Discount',    title: 'Special Offer — 50% Off!',   body: 'Book your appointment today and save 50% on consultation fees. Limited slots available.' },
  { label: '📅 Reminder',   title: 'Appointment Reminder',        body: "Don't forget your upcoming appointment. We look forward to seeing you." },
  { label: '👨‍⚕️ New Doctor', title: 'New Specialist Available!',  body: 'A new specialist has joined our team. Book your appointment today.' },
  { label: '🏥 Checkup',    title: 'Annual Checkup Due',          body: 'Stay ahead of your health. Schedule your annual checkup with our specialists.' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationCenter({ initialLogs }: { initialLogs: NotificationLog[] }) {
  const [logs, setLogs]       = useState<NotificationLog[]>(initialLogs);
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');
  const [ok, setOk]           = useState(false);

  const tablesMissing = initialLogs.length === 0 && false; // will detect via API errors

  function applyTemplate(t: typeof TEMPLATES[0]) { setTitle(t.title); setBody(t.body); setError(''); setOk(false); }

  async function handleSend() {
    if (!title.trim() || !body.trim()) { setError('Both title and message are required.'); return; }
    setSending(true); setError(''); setOk(false);
    try {
      const res = await fetch('/api/admin/notifications', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), body: body.trim(), target: 'all' }) });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Send failed');
      }
      const { log } = await res.json();
      setLogs(prev => [log, ...prev]);
      setTitle(''); setBody(''); setOk(true);
      setTimeout(() => setOk(false), 4000);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to send'); }
    finally { setSending(false); }
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Migration notice */}
      {tablesMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">Run <code className="bg-amber-100 px-1.5 rounded text-xs font-mono">admin-setup.sql</code> to enable notification logs.</p>
        </div>
      )}

      {/* Compose */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0f3460]/5 to-[#16a085]/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0f3460] rounded-xl flex items-center justify-center">
              <Bell size={15} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Compose Notification</h2>
              <p className="text-xs text-gray-500">Broadcast a message to all registered users</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Templates */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Templates</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => applyTemplate(t)}
                  className="text-xs font-medium bg-[#0f3460]/8 text-[#0f3460] border border-[#0f3460]/15 px-3 py-1.5 rounded-full hover:bg-[#0f3460]/15 transition-colors">
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Title *</label>
              <span className="text-xs text-gray-400">{title.length}/80</span>
            </div>
            <input type="text" value={title} maxLength={80}
              onChange={e => { setTitle(e.target.value); setError(''); setOk(false); }}
              placeholder="Enter notification title…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085] bg-gray-50" />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Message *</label>
              <span className="text-xs text-gray-400">{body.length}/200</span>
            </div>
            <textarea value={body} maxLength={200} rows={4}
              onChange={e => { setBody(e.target.value); setError(''); setOk(false); }}
              placeholder="Write your notification message…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085] resize-none bg-gray-50" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">{error}</div>}
          {ok && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Notification logged successfully!
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users size={13} />
              Broadcast to all users
            </div>
            <button onClick={handleSend} disabled={sending}
              className="flex items-center gap-2 bg-[#0f3460] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0a2444] disabled:opacity-50 transition-colors shadow-sm">
              {sending ? <><RefreshCw size={14} className="animate-spin" />Sending…</> : <><Send size={14} />Send Notification</>}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <Clock size={15} className="text-gray-400" />
          Notification History
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{logs.length}</span>
        </h2>
        {logs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 text-center">
            <Bell size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No notifications sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#16a085]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bell size={17} className="text-[#16a085]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{log.title}</h4>
                    <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(log.sent_at)}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{log.body}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Users size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{log.target === 'all' ? 'All Users' : 'Specific User'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
