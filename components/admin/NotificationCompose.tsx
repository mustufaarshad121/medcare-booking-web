'use client';

import { useState } from 'react';
import { Send, Bell, Clock, RefreshCw, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: string;
  target: string;
  sent_by: string;
  created_at: string;
}

type NotifType = 'info' | 'reminder' | 'warning';

const TYPE_LABELS: Record<NotifType, string> = {
  info: 'Info',
  reminder: 'Reminder',
  warning: 'Warning',
};

const TYPE_BADGE: Record<string, string> = {
  info:     'bg-blue-500/20 text-blue-300',
  reminder: 'bg-amber-500/20 text-amber-300',
  warning:  'bg-red-500/20 text-red-300',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function sendNotification(message: string, type: string, target: string): Promise<Notification> {
  const res = await fetch('/api/admin/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, type, target }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Send failed');
  return data.notification as Notification;
}

export default function NotificationCompose({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [message, setMessage]             = useState('');
  const [type, setType]                   = useState<NotifType>('info');
  const [target, setTarget]               = useState('');
  const [sending, setSending]             = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);

  async function handleSend() {
    if (!message.trim()) { setError('Message is required.'); return; }
    setSending(true); setError(''); setSuccess(false);
    try {
      const notif = await sendNotification(message.trim(), type, target.trim() || 'all');
      setNotifications(prev => [notif, ...prev]);
      setMessage(''); setTarget(''); setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">

      {/* ── Compose Form ── */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center">
            <Send size={16} className="text-teal-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">Compose Notification</h2>
            <p className="text-xs text-gray-400">Send to a specific user email or broadcast to all</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Message
            </label>
            <textarea
              value={message}
              onChange={e => { setMessage(e.target.value); setError(''); }}
              placeholder="Write your notification message…"
              rows={3}
              maxLength={500}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as NotifType)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {(Object.keys(TYPE_LABELS) as NotifType[]).map(t => (
                  <option key={t} value={t} className="bg-[#1a1a2e]">{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Target (email or leave blank for all)
              </label>
              <input
                type="email"
                value={target}
                onChange={e => { setTarget(e.target.value); setError(''); }}
                placeholder="user@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle size={14} /> Notification sent successfully!
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {sending
              ? <><RefreshCw size={14} className="animate-spin" /> Sending…</>
              : <><Send size={14} /> Send Notification</>}
          </button>
        </div>
      </div>

      {/* ── History ── */}
      <div>
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
          <Clock size={15} className="text-gray-400" />
          Sent Notifications
          <span className="bg-white/10 text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        </h2>

        {notifications.length === 0 ? (
          <div className="bg-[#1a1a2e] rounded-2xl border border-dashed border-white/10 py-14 text-center">
            <Bell size={28} className="mx-auto mb-2 text-gray-600" />
            <p className="text-sm text-gray-500">No notifications sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const badgeCls = TYPE_BADGE[n.type] ?? 'bg-gray-500/20 text-gray-300';
              return (
                <div
                  key={n.id}
                  className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-4 flex items-start gap-4 hover:border-white/20 transition-colors"
                >
                  <div className="w-10 h-10 bg-teal-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info size={17} className="text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeCls}`}>
                          {n.type}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          → {n.target === 'all' ? 'All Users' : n.target}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
