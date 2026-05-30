import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import DoctorsSection from '@/components/home/DoctorsSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import LocationsSection from '@/components/home/LocationsSection';

export default function HomePage() {
  return (
    <>
      <HeroSection isLoggedIn={false} />
      <ServicesSection />
      <DoctorsSection isLoggedIn={false} />
      <WhyChooseUsSection />
      <LocationsSection />
    </>
  );
}
