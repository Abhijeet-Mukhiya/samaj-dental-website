import React from 'react';
import { SEO } from '../components/ui/SEO';
import { HeroSection } from '../components/sections/HeroSection';
import { TrustStatsSection } from '../components/sections/TrustStatsSection';
import { FeaturedServicesSection } from '../components/sections/FeaturedServicesSection';
import { AboutSection } from '../components/sections/AboutSection';
import { DoctorsSection } from '../components/sections/DoctorsSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { GallerySection } from '../components/sections/GallerySection';
import { FAQSection } from '../components/sections/FAQSection';
import { MapContactSection } from '../components/sections/MapContactSection';
import { CTASection } from '../components/sections/CTASection';
import { clinicConfig } from '../config/clinic';

export const HomePage: React.FC = () => {
  return (
    <>
      <SEO />
      <main>
        <HeroSection />
        <TrustStatsSection />
        <FeaturedServicesSection limit={6} />
        <AboutSection />
        <DoctorsSection limit={4} />
        {clinicConfig.testimonials.length > 0 && <TestimonialsSection />}
        <GallerySection />
        <FAQSection />
        <MapContactSection />
        <CTASection />
      </main>
    </>
  );
};
