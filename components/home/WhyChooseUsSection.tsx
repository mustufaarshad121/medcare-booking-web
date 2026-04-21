import { Award, MapPin, CalendarCheck } from 'lucide-react';

const PILLARS = [
  {
    icon: Award,
    title: 'Board-Certified Specialists',
    description:
      'All physicians hold board certifications in their specialty fields and maintain active memberships in leading medical associations.',
  },
  {
    icon: MapPin,
    title: '3 Global Locations',
    description:
      'Conveniently located in New York, London, and Dubai — bringing world-class specialist care closer to you wherever you are.',
  },
  {
    icon: CalendarCheck,
    title: 'Same-Week Appointments',
    description:
      'We understand that health concerns can&apos;t wait. Our scheduling system is designed to get you seen quickly, usually within the same week.',
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f3460]">Why Choose MedCare Health?</h2>
          <p className="text-[#64748b] mt-3 max-w-xl mx-auto">
            We are committed to delivering exceptional, patient-centered care for adults who deserve it most.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((p) => (
            <div key={p.title} className="text-center px-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#16a085]/10 text-[#16a085] rounded-xl mb-5">
                <p.icon size={28} />
              </div>
              <h3 className="text-xl font-semibold text-[#0f3460] mb-3">{p.title}</h3>
              <p className="text-[#64748b] leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
