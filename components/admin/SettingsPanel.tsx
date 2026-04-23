'use client';

import { useState } from 'react';
import { Save, Bell, Calendar, DollarSign, Info, RefreshCw, Stethoscope } from 'lucide-react';

interface Props { initialSettings: Record<string, string> }

export default function SettingsPanel({ initialSettings }: Props) {
  const [s, setS] = useState({
    notifications_enabled:    initialSettings.notifications_enabled !== 'false',
    max_bookings_per_day:     initialSettings.max_bookings_per_day ?? '10',
    default_consultation_fee: initialSettings.default_consultation_fee ?? '150',
    max_doctors_per_specialty:initialSettings.max_doctors_per_specialty ?? '5',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');
  const [dirty, setDirty]   = useState(false);

  function set<K extends keyof typeof s>(k: K, v: (typeof s)[K]) {
    setS(prev => ({ ...prev, [k]: v }));
    setDirty(true); setSaved(false);
  }

  async function handleSave() {
    setError('');
    const maxB = parseInt(s.max_bookings_per_day, 10);
    const fee  = parseInt(s.default_consultation_fee, 10);
    const maxD = parseInt(s.max_doctors_per_specialty, 10);
    if (isNaN(maxB) || maxB < 1)  { setError('Max bookings must be at least 1.'); return; }
    if (isNaN(fee)  || fee < 0)   { setError('Fee must be a positive number.'); return; }
    if (isNaN(maxD) || maxD < 1)  { setError('Max doctors must be at least 1.'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', { method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications_enabled:    String(s.notifications_enabled),
          max_bookings_per_day:     String(maxB),
          default_consultation_fee: String(fee),
          max_doctors_per_specialty:String(maxD),
        }) });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
      setDirty(false); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  }

  const numInput = (k: 'max_bookings_per_day' | 'default_consultation_fee' | 'max_doctors_per_specialty') => (
    <input type="number" value={s[k]}
      onChange={e => set(k, e.target.value.replace(/[^0-9]/g, ''))}
      min="0" max="99999"
      className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a085] bg-gray-50" />
  );

  const Card = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-[#0f3460]/10 rounded-lg flex items-center justify-center">{icon}</div>
        <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between px-6 py-4">
      <div><p className="text-sm font-medium text-gray-800">{label}</p>{sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}</div>
      {children}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      {/* Notifications */}
      <Card icon={<Bell size={15} className="text-[#0f3460]" />} title="Notifications">
        <Row label="Push Notifications" sub="Send alerts to registered patients">
          <button onClick={() => set('notifications_enabled', !s.notifications_enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${s.notifications_enabled ? 'bg-[#16a085]' : 'bg-gray-200'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${s.notifications_enabled ? 'translate-x-6' : ''}`} />
          </button>
        </Row>
      </Card>

      {/* Booking Limits */}
      <Card icon={<Calendar size={15} className="text-[#0f3460]" />} title="Booking Limits">
        <div className="divide-y divide-gray-50">
          <Row label="Max Bookings per Day" sub="System-wide daily booking cap">{numInput('max_bookings_per_day')}</Row>
          <Row label="Max Doctors per Specialty" sub="Cap per medical specialty">{numInput('max_doctors_per_specialty')}</Row>
        </div>
      </Card>

      {/* Financials */}
      <Card icon={<DollarSign size={15} className="text-[#0f3460]" />} title="Financials">
        <Row label="Default Consultation Fee ($)" sub="Applied to newly added doctors">{numInput('default_consultation_fee')}</Row>
      </Card>

      {/* App Info */}
      <Card icon={<Info size={15} className="text-[#0f3460]" />} title="App Information">
        <div className="divide-y divide-gray-50">
          {([['App Name','MedCare Health'],['Version','1.0.0'],['Admin Panel','v2.0'],['Database','Supabase']] as [string,string][]).map(([k,v]) => (
            <div key={k} className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-gray-500">{k}</span>
              <span className="text-sm font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Settings saved successfully!
        </div>
      )}

      <button onClick={handleSave} disabled={!dirty || saving}
        className="w-full flex items-center justify-center gap-2 bg-[#0f3460] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#0a2444] disabled:opacity-40 transition-all shadow-sm">
        {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
}
