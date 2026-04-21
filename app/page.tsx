import { createClient } from '@/lib/supabase/server';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import DoctorsSection from '@/components/home/DoctorsSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import LocationsSection from '@/components/home/LocationsSection';

export default async function HomePage() {
  let isLoggedIn = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isLoggedIn = !!user;
  } catch {
    // Supabase not configured — render public view
  }
  return (
    <>
      <HeroSection isLoggedIn={isLoggedIn} />
      <ServicesSection />
      <DoctorsSection isLoggedIn={isLoggedIn} />
      <WhyChooseUsSection />
      <LocationsSection />
    </>
  );
}
