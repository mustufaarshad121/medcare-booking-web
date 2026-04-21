'use client';

import { useState } from 'react';
import { MapPin, Phone, Clock, Mail, Send, CheckCircle } from 'lucide-react';
import { CLINIC_LOCATIONS } from '@/lib/data';
import Button from '@/components/ui/Button';

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Contact form submission:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  }

  return (
    <>
      {/* Mission */}
      <section className="bg-[#0f3460] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About MedCare Health</h1>
            <p className="text-lg md:text-xl text-white/75 leading-relaxed mb-4">
              MedCare Health was founded with a single mission: to deliver world-class preventive
              and specialist care to adults who need it most. We focus on early detection of cancer,
              management of smoking-related conditions, and cardiovascular health — conditions that
              disproportionately affect adults 45 and older.
            </p>
            <p className="text-lg text-white/65 leading-relaxed">
              Our board-certified specialists operate across three global locations — New York,
              London, and Dubai — providing the same rigorous standard of care no matter where
              you are. We believe that access to expert medical care should never be a barrier.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0f3460] mb-10 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Patient-Centered Care',
                description:
                  'Every decision we make starts with what is best for the patient. We listen, we explain, and we involve patients in every step of their health journey.',
              },
              {
                title: 'Evidence-Based Medicine',
                description:
                  'Our protocols are rooted in the latest clinical research and guidelines. We continuously update our practices to reflect emerging evidence in preventive medicine.',
              },
              {
                title: 'Accessible Excellence',
                description:
                  'World-class care should not require a long wait. Our same-week appointment commitment ensures patients receive timely attention when it matters most.',
              },
            ].map((v) => (
              <div key={v.title} className="bg-[#f8fafc] rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-[#0f3460] mb-3">{v.title}</h3>
                <p className="text-[#64748b] leading-relaxed text-sm">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f3460]">Our Locations</h2>
            <p className="text-[#64748b] mt-3">Visit us at any of our three world-class clinics.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CLINIC_LOCATIONS.map((loc) => (
              <div
                key={loc.city}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold text-[#0f3460] mb-4">{loc.city}</h3>
                <div className="space-y-3 text-sm text-[#64748b]">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-[#16a085] mt-0.5 shrink-0" />
                    <span>{loc.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-[#16a085] shrink-0" />
                    <span>{loc.phone}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-[#16a085] mt-0.5 shrink-0" />
                    <div>
                      <p>{loc.hours_weekday}</p>
                      <p>{loc.hours_saturday}</p>
                      <p className="text-[#64748b]/60">Closed Sundays</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748b]/60 pt-1">{loc.timezone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#16a085]/10 text-[#16a085] rounded-xl mb-4">
              <Mail size={24} />
            </div>
            <h2 className="text-3xl font-bold text-[#0f3460]">Contact Us</h2>
            <p className="text-[#64748b] mt-2">
              Have a question? Send us a message and we&apos;ll get back to you within one business day.
            </p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <CheckCircle size={40} className="text-[#059669] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0f3460] mb-2">Message Received</h3>
              <p className="text-[#64748b]">
                Thank you for reaching out. A member of our team will contact you within one
                business day.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm text-[#16a085] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#0f3460] mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#1a202c] focus:outline-none focus:ring-2 focus:ring-[#16a085]/40 focus:border-[#16a085]"
                  placeholder="James Anderson"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#0f3460] mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#1a202c] focus:outline-none focus:ring-2 focus:ring-[#16a085]/40 focus:border-[#16a085]"
                  placeholder="james@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#0f3460] mb-1.5">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#1a202c] focus:outline-none focus:ring-2 focus:ring-[#16a085]/40 focus:border-[#16a085] resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <Button type="submit" size="lg" className="w-full bg-[#16a085] hover:bg-[#12876e] border-transparent text-white">
                Send Message <Send size={16} />
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
