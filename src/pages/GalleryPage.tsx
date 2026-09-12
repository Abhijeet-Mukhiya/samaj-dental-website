import React from 'react';
import { SEO } from '../components/ui/SEO';
import { GallerySection } from '../components/sections/GallerySection';
import { CTASection } from '../components/sections/CTASection';
import { clinicConfig } from '../config/clinic';

export const GalleryPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Clinic Gallery & Facilities"
        description={`Preview how clinic facilities and treatment images can be presented for ${clinicConfig.name}.`}
      />
      <main>
        <section className="bg-navy-950 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest bg-navy-900 px-3.5 py-1.5 rounded-full border border-navy-800 inline-block mb-4">
              Clinic Gallery
            </span>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4">
              Clinic Photo Gallery
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Preview how clinic photos and facilities can be presented. Replace sample images with clinic-approved photography before launch.
            </p>
          </div>
        </section>

        <GallerySection />
        <CTASection />
      </main>
    </>
  );
};
