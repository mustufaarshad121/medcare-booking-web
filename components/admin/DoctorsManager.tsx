'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, RefreshCw, Stethoscope } from 'lucide-react';
import type { DoctorWithFee } from '@/lib/types';
import { SPECIALTIES, CLINIC_LOCATIONS } from '@/lib/data';

const AVATAR_COLORS = [
  '#c0392b','#2980b9','#27ae60','#16a085',
  '#e67e22','#8e44ad','#d35400','#0f3460',
];

interface Form {
  name: string; specialty: string; location: string; bio: string;
  avatar_color: string; consultation_fee: string; is_available: boolean;
}

const EMPTY: Form = {
  name: '', specialty: 'Cardiology', location: 'New York',
  bio: '', avatar_color: AVATAR_COLORS[0], consultation_fee: '150', is_available: true,
};

function initials(name: string) {
  return name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function DoctorsManager({ initialDoctors }: { initialDoctors: DoctorWithFee[] }) {
  const [doctors, setDoctors] = useState<DoctorWithFee[]>(initialDoctors);
  const [modal, setModal]     = useState(false);
  const [edit, setEdit]       = useState<DoctorWithFee | null>(null);
  const [form, setForm]       = useState<Form>(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [delId, setDelId]     = useState<string | null>(null);
  const [err, setErr]         = useState('');

  function openAdd() { setEdit(null); setForm(EMPTY); setErr(''); setModal(true); }
  function openEdit(d: DoctorWithFee) {
    setEdit(d);
    setForm({ name: d.name, specialty: d.specialty, location: d.location,
      bio: d.bio ?? '', avatar_color: d.avatar_color ?? AVATAR_COLORS[0],
      consultation_fee: String(d.consultation_fee), is_available: d.is_available });
    setErr(''); setModal(true);
  }
  function setF<K extends keyof Form>(k: K, v: Form[K]) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.name.trim()) { setErr('Name is required.'); return; }
    const fee = parseInt(form.consultation_fee, 10);
    if (isNaN(fee) || fee < 0) { setErr('Enter a valid consultation fee.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = { name: form.name.trim(), specialty: form.specialty, location: form.location,
        bio: form.bio.trim(), avatar_color: form.avatar_color, consultation_fee: fee, is_available: form.is_available };
      if (edit) {
        const res = await fetch(`/api/admin/doctors/${edit.id}`, { method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error((await res.json()).error ?? 'Update failed');
        setDoctors(prev => prev.map(d => d.id === edit.id ? ({ ...d, ...payload } as DoctorWithFee) : d));
      } else {
        const res = await fetch('/api/admin/doctors', { method: 'POST',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error((await res.json()).error ?? 'Create failed');
        const { doctor } = await res.json();
        setDoctors(prev => [doctor as DoctorWithFee, ...prev]);
      }
      setModal(false);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  }

  async function handleDelete(d: DoctorWithFee) {
    if (!confirm(`Delete ${d.name}? This cannot be undone.`)) return;
    setDelId(d.id);
    try {
      const res = await fetch(`/api/admin/doctors/${d.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDoctors(prev => prev.filter(x => x.id !== d.id));
    } catch { alert('Delete failed'); }
    finally { setDelId(null); }
  }

  async function toggleAvailable(d: DoctorWithFee) {
    try {
      const res = await fetch(`/api/admin/doctors/${d.id}`, { method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_available: !d.is_available }) });
      if (!res.ok) throw new Error();
      setDoctors(prev => prev.map(x => x.id === d.id ? { ...x, is_available: !d.is_available } : x));
    } catch { alert('Update failed'); }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} registered</p>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#0f3460] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0a2444] transition-colors shadow-sm">
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {doctors.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                style={{ backgroundColor: doc.avatar_color ?? '#0f3460' }}>
                {initials(doc.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-sm">{doc.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{doc.specialty}</p>
                <p className="text-xs text-gray-400">{doc.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                ${doc.consultation_fee ?? 0}
              </span>
              <button onClick={() => toggleAvailable(doc)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  doc.is_available ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                {doc.is_available ? '✓ Available' : '✗ Unavailable'}
              </button>
            </div>
            {doc.bio && <p className="text-xs text-gray-400 line-clamp-2 mb-4">{doc.bio}</p>}
            <div className="flex gap-2 pt-3 border-t border-gray-50">
              <button onClick={() => openEdit(doc)}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => handleDelete(doc)} disabled={delId === doc.id}
                className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {delId === doc.id ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                {delId === doc.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
        {doctors.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <Stethoscope size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-400">No doctors yet. Click &quot;Add Doctor&quot; to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{edit ? 'Edit Doctor' : 'Add New Doctor'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {err && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">{err}</div>}

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Dr. Jane Smith"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085] focus:border-transparent bg-gray-50" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Specialty</label>
                  <select value={form.specialty} onChange={e => setF('specialty', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085] bg-gray-50">
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Location</label>
                  <select value={form.location} onChange={e => setF('location', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085] bg-gray-50">
                    {CLINIC_LOCATIONS.map(l => <option key={l.city} value={l.city}>{l.city}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={e => setF('bio', e.target.value)} rows={3}
                  placeholder="Professional background and specializations…"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085] resize-none bg-gray-50" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Consultation Fee ($)</label>
                <input type="number" value={form.consultation_fee} onChange={e => setF('consultation_fee', e.target.value)} min="0"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085] bg-gray-50" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Avatar Color</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map(c => (
                    <button key={c} onClick={() => setF('avatar_color', c)}
                      className={`w-8 h-8 rounded-full transition-all ${form.avatar_color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">Available for Bookings</p>
                  <p className="text-xs text-gray-400">Patients can book appointments</p>
                </div>
                <button onClick={() => setF('is_available', !form.is_available)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_available ? 'bg-[#16a085]' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_available ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-white transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[#0f3460] text-white rounded-xl hover:bg-[#0a2444] disabled:opacity-50 transition-colors">
                {saving && <RefreshCw size={14} className="animate-spin" />}
                {saving ? 'Saving…' : edit ? 'Save Changes' : 'Add Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
