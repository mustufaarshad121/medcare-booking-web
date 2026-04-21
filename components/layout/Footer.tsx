import Link from 'next/link';
import { Heart, MapPin, Phone } from 'lucide-react';
import { CLINIC_LOCATIONS } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="bg-[#0f3460] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <Heart className="text-[#16a085]" size={22} />
              <span>MedCare Health</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Expert preventive care for adults 45+. Specialists in oncology,
              pulmonology, and chronic disease management.
            </p>
          </div>

          {/* Locations */}
          {CLINIC_LOCATIONS.map((loc) => (
            <div key={loc.city}>
              <h3 className="font-semibold text-[#16a085] mb-3">{loc.city}</h3>
              <div className="space-y-2 text-sm text-white/70">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span>{loc.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0" />
                  <span>{loc.phone}</span>
                </div>
                <p className="text-white/50 text-xs">{loc.hours_weekday}</p>
                <p className="text-white/50 text-xs">{loc.hours_saturday}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© 2026 MedCare Health. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white/80 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white/80 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
