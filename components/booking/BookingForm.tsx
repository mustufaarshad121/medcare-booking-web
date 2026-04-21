'use client';

import { useState } from 'react';
import type { Doctor, Specialty, ClinicCity } from '@/lib/types';
import { SPECIALTIES, CLINIC_LOCATIONS, getMinDate, getMaxDate } from '@/lib/data';
import DoctorCard from './DoctorCard';
import TimeSlotPicker from './TimeSlotPicker';
import BookingConfirmation from './BookingConfirmation';
import Button from '@/components/ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type Step = 1 | 2 | 3 | 'confirmed';

interface BookingFormProps {
  doctors: Doctor[];
}

interface Confirmed {
  doctor: Doctor;
  date: string;
  timeSlot: string;
  location: string;
}

export default function BookingForm({ doctors }: BookingFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [phone, setPhone] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  const [specialtyFilter, setSpecialtyFilter] = useState<Specialty | ''>('');
  const [locationFilter, setLocationFilter] = useState<ClinicCity | ''>('');

  const filteredDoctors = doctors.filter((d) => {
    if (specialtyFilter && d.specialty !== specialtyFilter) return false;
    if (locationFilter && d.location !== locationFilter) return false;
    return true;
  });

  const canProceedStep1 = selectedDoctor !== null;
  const canProceedStep2 = selectedDate !== '' && selectedSlot !== '';

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !phone.trim()) return;
    setSubmitError('');
    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          patient_phone: phone,
          appointment_date: selectedDate,
          time_slot: selectedSlot,
          location: selectedDoctor.location,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.message || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setConfirmed({
        doctor: selectedDoctor,
        date: selectedDate,
        timeSlot: selectedSlot,
        location: selectedDoctor.location,
      });
      setStep('confirmed');
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirmed' && confirmed) {
    return (
      <BookingConfirmation
        doctor={confirmed.doctor}
        date={confirmed.date}
        timeSlot={confirmed.timeSlot}
        location={confirmed.location}
      />
    );
  }

  const stepNum = step as number;

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {[
          { n: 1, label: 'Choose Doctor' },
          { n: 2, label: 'Date & Time' },
          { n: 3, label: 'Your Details' },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  stepNum >= n
                    ? 'bg-[#0f3460] text-white'
                    : 'bg-gray-200 text-[#64748b]'
                }`}
              >
                {n}
              </div>
              <span className="text-xs mt-1 text-[#64748b] hidden sm:block">{label}</span>
            </div>
            {i < 2 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${stepNum > n ? 'bg-[#0f3460]' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Choose Doctor */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold text-[#0f3460] mb-4">Choose a Doctor</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value as Specialty | '')}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085]"
            >
              <option value="">All Specialties</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value as ClinicCity | '')}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085]"
            >
              <option value="">All Locations</option>
              {CLINIC_LOCATIONS.map((l) => (
                <option key={l.city} value={l.city}>{l.city}</option>
              ))}
            </select>
          </div>

          {filteredDoctors.length === 0 ? (
            <p className="text-[#64748b] text-sm py-8 text-center">
              No doctors found for the selected filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {filteredDoctors.map((d) => (
                <DoctorCard
                  key={d.id}
                  doctor={d}
                  isSelected={selectedDoctor?.id === d.id}
                  onSelect={() => setSelectedDoctor(d)}
                />
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              size="lg"
            >
              Next: Date & Time <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Date & Time */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold text-[#0f3460] mb-4">
            Select Date & Time
          </h2>
          <p className="text-sm text-[#64748b] mb-4">
            Booking with <span className="font-medium text-[#0f3460]">{selectedDoctor?.name}</span>
            {' · '}{selectedDoctor?.specialty}
          </p>

          <div className="mb-5">
            <label className="block text-sm font-medium text-[#1a202c] mb-1">
              Appointment Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={getMinDate()}
              max={getMaxDate()}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot('');
              }}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085]"
            />
            <p className="text-xs text-[#64748b] mt-1">Mon–Fri: 8AM–5PM · Sat: 9AM–1PM · Closed Sundays</p>
          </div>

          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1a202c] mb-2">
                Available Time Slots
              </label>
              <TimeSlotPicker
                date={selectedDate}
                selectedSlot={selectedSlot}
                onSelect={setSelectedSlot}
              />
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)} size="lg">
              <ChevronLeft size={16} /> Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              size="lg"
            >
              Next: Your Details <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Patient Details */}
      {step === 3 && selectedDoctor && (
        <div>
          <h2 className="text-xl font-semibold text-[#0f3460] mb-4">Review & Confirm</h2>

          {/* Summary */}
          <div className="bg-[#0f3460]/5 border border-[#0f3460]/10 rounded-xl p-4 mb-5 space-y-2 text-sm">
            <p><span className="text-[#64748b]">Doctor:</span> <span className="font-medium">{selectedDoctor.name}</span></p>
            <p><span className="text-[#64748b]">Specialty:</span> <span className="font-medium">{selectedDoctor.specialty}</span></p>
            <p><span className="text-[#64748b]">Date:</span> <span className="font-medium">{selectedDate}</span></p>
            <p><span className="text-[#64748b]">Time:</span> <span className="font-medium">{selectedSlot}</span></p>
            <p><span className="text-[#64748b]">Location:</span> <span className="font-medium">MedCare Health — {selectedDoctor.location}</span></p>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-[#1a202c] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a085]"
            />
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {submitError}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)} size="lg">
              <ChevronLeft size={16} /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !phone.trim()}
              size="lg"
            >
              {loading ? 'Booking…' : 'Confirm Appointment'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
