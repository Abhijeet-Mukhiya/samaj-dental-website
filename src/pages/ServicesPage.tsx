import React from 'react';
import { SEO } from '../components/ui/SEO';
import { FeaturedServicesSection } from '../components/sections/FeaturedServicesSection';
import { CTASection } from '../components/sections/CTASection';
import { clinicConfig } from '../config/clinic';

export const ServicesPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Comprehensive Dental Services"
        description={`Explore full-scope general, cosmetic, restorative, orthodontics, and emergency dental procedures at ${clinicConfig.name}.`}
      />
      <main>
        {/* Hero Header */}
        <section className="bg-navy-950 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest bg-navy-900 px-3.5 py-1.5 rounded-full border border-navy-800 inline-block mb-4">
              Dental Care Services
            </span>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4">
              Our Dental Treatments & Services
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore representative dental services and treatment information. Availability, suitability, and pricing should be confirmed with the clinic.
            </p>
          </div>
        </section>

        <FeaturedServicesSection showCategoryFilter={true} />
        <CTASection />
      </main>
    </>
  );
};
