import Link from 'next/link';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import Button from '@/components/ui/Button';

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export default function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="bg-[#0f3460] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#16a085]/20 border border-[#16a085]/30 text-[#16a085] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <CalendarCheck size={14} />
            Same-Week Appointments Available
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Expert Care for Your{' '}
            <span className="text-[#16a085]">Health Journey</span>
          </h1>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed mb-8 max-w-2xl">
            Specialized preventive care for adults 45+ — from cancer screening and
            smoking cessation programs to cardiovascular and respiratory health. Board-certified
            specialists across New York, London, and Dubai.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={isLoggedIn ? '/book' : '/login'}>
              <Button
                size="lg"
                className="bg-[#16a085] hover:bg-[#12876e] border-transparent text-white w-full sm:w-auto"
              >
                Book Appointment <ArrowRight size={18} />
              </Button>
            </Link>
            <a href="#doctors">
              <Button
                variant="ghost"
                size="lg"
                className="text-white border border-white/30 hover:bg-white/10 w-full sm:w-auto"
              >
                Meet Our Doctors
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
