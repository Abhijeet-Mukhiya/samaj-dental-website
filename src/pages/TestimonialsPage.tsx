import React from 'react';
import { SEO } from '../components/ui/SEO';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { CTASection } from '../components/sections/CTASection';
import { clinicConfig } from '../config/clinic';
import { Navigate } from 'react-router-dom';

export const TestimonialsPage: React.FC = () => {
  if (!clinicConfig.siteSections.testimonials || clinicConfig.testimonials.length === 0) return <Navigate to="/" replace />;

  return (
    <>
      <SEO
        title="Patient Reviews & Testimonials"
        description={`Read patient reviews and testimonials for ${clinicConfig.name}. Discover why local families trust us for gentle dentistry.`}
      />
      <main>
        <section className="bg-navy-950 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest bg-navy-900 px-3.5 py-1.5 rounded-full border border-navy-800 inline-block mb-4">
              Sample Demonstration Content
            </span>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4">
              Patient Reviews & Feedback
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              This page demonstrates how approved patient feedback can be presented. Replace sample content with clinic-approved reviews before launch.
            </p>
          </div>
        </section>

        <TestimonialsSection />
        <CTASection />
      </main>
    </>
  );
};
