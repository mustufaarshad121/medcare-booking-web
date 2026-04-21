import { MapPin, Phone, Clock } from 'lucide-react';
import { CLINIC_LOCATIONS } from '@/lib/data';

export default function LocationsSection() {
  return (
    <section className="py-16 md:py-20 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f3460]">Our Locations</h2>
          <p className="text-[#64748b] mt-3">
            Three world-class clinics. One standard of care.
          </p>
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
  );
}
