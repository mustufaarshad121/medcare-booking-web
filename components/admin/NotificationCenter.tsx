'use client';

import { useState } from 'react';
import { Send, Bell, Clock, RefreshCw, CheckCircle, Megaphone, Zap } from 'lucide-react';
import type { NotificationLog } from '@/lib/types';

// ─── types ───────────────────────────────────────────────────────────────────

type NotifType = 'info' | 'reminder' | 'warning';

interface BulkTemplate {
  emoji: string;
  category: string;
  title: string;
  body: string;
}

// ─── constants ───────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotifType, { label: string; title: string }> = {
  info:     { label: 'Info',     title: 'Health Information' },
  reminder: { label: 'Reminder', title: 'Appointment Reminder' },
  warning:  { label: 'Warning',  title: 'Important Notice' },
};

const BULK_TEMPLATES: BulkTemplate[] = [
  {
    emoji: '🎉',
    category: 'Promotional',
    title: 'Special Offer — 50% Off!',
    body: 'Book your appointment this week and save 50% on consultation fees. Limited slots available — act now!',
  },
  {
    emoji: '💸',
    category: 'Discount',
    title: 'Exclusive Discount for Loyal Patients',
    body: 'As a valued member of MedCare, enjoy 30% off on your next specialist consultation. Use code LOYAL30.',
  },
  {
    emoji: '💡',
    category: 'Health Tip',
    title: 'Health Tip of the Week',
    body: 'Stay hydrated! Drinking at least 8 glasses of water daily improves energy, focus, and overall health.',
  },
  {
    emoji: '🌿',
    category: 'Health Tip',
    title: 'Boost Your Immunity Naturally',
    body: 'Eat a balanced diet rich in vitamins C and D, get regular sleep, and exercise 30 minutes a day.',
  },
  {
    emoji: '📅',
    category: 'Reminder',
    title: 'Annual Checkup Reminder',
    body: "It's time for your annual health checkup! Early detection saves lives. Schedule yours today.",
  },
  {
    emoji: '🩺',
    category: 'Reminder',
    title: 'Don\'t Skip Your Follow-Up',
    body: 'Following up after treatment is key to recovery. Book your follow-up appointment with your specialist.',
  },
  {
    emoji: '🌟',
    category: 'New Services',
    title: 'New Services Now Available',
    body: "We've expanded! New specialists and services are now available at all MedCare clinics. Explore today.",
  },
  {
    emoji: '❄️',
    category: 'Seasonal',
    title: 'Flu Season is Here — Stay Protected',
    body: 'Protect yourself this flu season. Schedule your vaccination appointment at any MedCare location.',
  },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function typeBadge(title: string) {
  const t = title.toLowerCase();
  if (t.includes('remind') || t.includes('appointment') || t.includes('checkup') || t.includes('follow'))
    return { label: 'Reminder', cls: 'bg-amber-500/20 text-amber-300' };
  if (t.includes('warn') || t.includes('notice') || t.includes('important'))
    return { label: 'Warning', cls: 'bg-red-500/20 text-red-300' };
  if (t.includes('offer') || t.includes('discount') || t.includes('off') || t.includes('promo'))
    return { label: 'Promo', cls: 'bg-purple-500/20 text-purple-300' };
  if (t.includes('tip') || t.includes('health') || t.includes('flu') || t.includes('boost'))
    return { label: 'Health Tip', cls: 'bg-green-500/20 text-green-300' };
  return { label: 'Info', cls: 'bg-blue-500/20 text-blue-300' };
}

async function postNotification(title: string, body: string, target: string) {
  const res = await fetch('/api/admin/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, target }),
  });
  if (!res.ok) {
    const d = await res.json();
    throw new Error(d.error ?? 'Send failed');
  }
  return (await res.json()).log as NotificationLog;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function NotificationCenter({ initialLogs }: { initialLogs: NotificationLog[] }) {
  const [logs, setLogs]             = useState<NotificationLog[]>(initialLogs);

  // direct notification state
  const [email, setEmail]           = useState('');
  const [type, setType]             = useState<NotifType>('info');
  const [sending, setSending]       = useState(false);
  const [sendErr, setSendErr]       = useState('');
  const [sendOk, setSendOk]         = useState(false);

  // bulk reminder state
  const [bulkSending, setBulkSending] = useState<string | null>(null); // template title being sent
  const [bulkOk, setBulkOk]           = useState<string | null>(null);
  const [bulkErr, setBulkErr]         = useState('');

  // custom reminder state
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody]   = useState('');
  const [customSending, setCustomSending] = useState(false);
  const [customOk, setCustomOk]       = useState(false);
  const [customErr, setCustomErr]     = useState('');

  // ── direct send ────────────────────────────────────────────────────────────
  async function handleSend() {
    setSending(true); setSendErr(''); setSendOk(false);
    try {
      const cfg = TYPE_CONFIG[type];
      const target = email.trim() || 'all';
      const log = await postNotification(
        cfg.title,
        `${cfg.label} notification sent to ${target === 'all' ? 'all users' : target}.`,
        target,
      );
      setLogs(prev => [log, ...prev]);
      setEmail(''); setSendOk(true);
      setTimeout(() => setSendOk(false), 4000);
    } catch (e) { setSendErr(e instanceof Error ? e.message : 'Failed to send'); }
    finally { setSending(false); }
  }

  // ── bulk template send ─────────────────────────────────────────────────────
  async function handleBulkSend(tmpl: BulkTemplate) {
    setBulkSending(tmpl.title); setBulkErr(''); setBulkOk(null);
    try {
      const log = await postNotification(tmpl.title, tmpl.body, 'all');
      setLogs(prev => [log, ...prev]);
      setBulkOk(tmpl.title);
      setTimeout(() => setBulkOk(null), 4000);
    } catch (e) { setBulkErr(e instanceof Error ? e.message : 'Failed to send'); }
    finally { setBulkSending(null); }
  }

  // ── custom reminder send ───────────────────────────────────────────────────
  async function handleCustomSend() {
    if (!customTitle.trim() || !customBody.trim()) {
      setCustomErr('Both title and message are required.'); return;
    }
    setCustomSending(true); setCustomErr(''); setCustomOk(false);
    try {
      const log = await postNotification(customTitle.trim(), customBody.trim(), 'all');
      setLogs(prev => [log, ...prev]);
      setCustomTitle(''); setCustomBody(''); setCustomOk(true);
      setTimeout(() => setCustomOk(false), 4000);
    } catch (e) { setCustomErr(e instanceof Error ? e.message : 'Failed to send'); }
    finally { setCustomSending(false); }
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl space-y-8">

      {/* ── 1. Send Notification (targeted) ── */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center">
            <Bell size={16} className="text-teal-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">Send Notification</h2>
            <p className="text-xs text-gray-400">Target a specific user or broadcast to everyone</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              User Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setSendErr(''); }}
              placeholder="user@example.com — leave blank to broadcast to all"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as NotifType)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="info" className="bg-[#1a1a2e]">Info</option>
              <option value="reminder" className="bg-[#1a1a2e]">Reminder</option>
              <option value="warning" className="bg-[#1a1a2e]">Warning</option>
            </select>
          </div>

          {sendErr && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm">{sendErr}</div>
          )}
          {sendOk && (
            <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle size={15} /> Notification sent successfully!
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {sending
              ? <><RefreshCw size={14} className="animate-spin" />Sending…</>
              : <><Send size={14} />Send Notification</>}
          </button>
        </div>
      </div>

      {/* ── 2. Bulk Reminders ── */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Megaphone size={16} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">Bulk Reminders</h2>
            <p className="text-xs text-gray-400">Send pre-built campaigns to all users instantly</p>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {bulkErr && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm">{bulkErr}</div>
          )}

          {BULK_TEMPLATES.map(tmpl => (
            <div key={tmpl.title}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-white/20 transition-colors">
              <span className="text-xl flex-shrink-0">{tmpl.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white truncate">{tmpl.title}</p>
                  <span className="text-xs font-medium text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full flex-shrink-0">
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1">{tmpl.body}</p>
              </div>
              {bulkOk === tmpl.title ? (
                <div className="flex items-center gap-1.5 text-teal-400 text-xs font-medium flex-shrink-0">
                  <CheckCircle size={14} /> Sent!
                </div>
              ) : (
                <button
                  onClick={() => handleBulkSend(tmpl)}
                  disabled={bulkSending !== null}
                  className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                  {bulkSending === tmpl.title
                    ? <RefreshCw size={12} className="animate-spin" />
                    : <Zap size={12} />}
                  {bulkSending === tmpl.title ? 'Sending…' : 'Send All'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Custom reminder */}
        <div className="px-6 pb-6 pt-5 space-y-3 border-t border-white/10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Custom Reminder</p>

          <input
            type="text"
            value={customTitle}
            onChange={e => { setCustomTitle(e.target.value); setCustomErr(''); }}
            placeholder="Reminder title…"
            maxLength={80}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <textarea
            value={customBody}
            onChange={e => { setCustomBody(e.target.value); setCustomErr(''); }}
            placeholder="Write your message to all users…"
            rows={3}
            maxLength={300}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />

          {customErr && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm">{customErr}</div>
          )}
          {customOk && (
            <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle size={15} /> Bulk reminder sent to all users!
            </div>
          )}

          <button
            onClick={handleCustomSend}
            disabled={customSending}
            className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {customSending
              ? <><RefreshCw size={14} className="animate-spin" />Sending…</>
              : <><Megaphone size={14} />Send to All Users</>}
          </button>
        </div>
      </div>

      {/* ── 3. Notification History ── */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <Clock size={15} className="text-gray-400" />
          Notification History
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
            {logs.length}
          </span>
        </h2>

        {logs.length === 0 ? (
          <div className="bg-[#1a1a2e] rounded-2xl border border-dashed border-white/10 py-14 text-center">
            <Bell size={28} className="mx-auto mb-2 text-gray-600" />
            <p className="text-sm text-gray-500">No notifications sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => {
              const badge = typeBadge(log.title);
              return (
                <div key={log.id}
                  className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-4 flex items-start gap-4 hover:border-white/20 transition-colors">
                  <div className="w-10 h-10 bg-teal-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell size={17} className="text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{log.title}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(log.sent_at)}</span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{log.body}</p>
                    <p className="text-xs text-gray-600 mt-1.5">
                      → {log.target === 'all' ? 'All Users' : log.target}
                    </p>
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
