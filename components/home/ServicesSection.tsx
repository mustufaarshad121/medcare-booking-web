import { Microscope, Wind, Heart, Stethoscope, Users } from 'lucide-react';

const SERVICES = [
  {
    icon: Microscope,
    title: 'Oncology',
    description:
      'Early detection and treatment of cancer, including lung, colorectal, and hereditary cancer syndromes. Specialized programs for high-risk adults.',
  },
  {
    icon: Wind,
    title: 'Pulmonology',
    description:
      'Diagnosis and management of COPD, smoking-related lung disease, and respiratory cancer screening for long-term smokers.',
  },
  {
    icon: Heart,
    title: 'Cardiology',
    description:
      'Preventive cardiology and cardiovascular risk reduction, including advanced lipid management and cardiac screening for adults over 45.',
  },
  {
    icon: Stethoscope,
    title: 'Internal Medicine',
    description:
      'Comprehensive preventive care, chronic disease management, and coordinated early detection across multiple conditions.',
  },
  {
    icon: Users,
    title: 'Family Medicine',
    description:
      'Long-term patient relationships built around preventive screenings, health coaching, and coordinated specialist referrals.',
  },
];

export default function ServicesSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f3460]">Our Specialties</h2>
          <p className="text-[#64748b] mt-3 max-w-xl mx-auto">
            Expert care across five disciplines most critical for adults 45 and older.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="flex flex-col items-start p-5 rounded-xl border border-gray-100 bg-[#f8fafc] hover:border-[#16a085]/40 hover:shadow-sm transition-all"
            >
              <div className="bg-[#0f3460]/10 text-[#0f3460] rounded-lg p-2.5 mb-4">
                <s.icon size={22} />
              </div>
              <h3 className="font-semibold text-[#0f3460] mb-2">{s.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
