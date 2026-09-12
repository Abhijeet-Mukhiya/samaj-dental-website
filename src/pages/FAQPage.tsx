import React from 'react';
import { SEO } from '../components/ui/SEO';
import { FAQSection } from '../components/sections/FAQSection';
import { CTASection } from '../components/sections/CTASection';
import { clinicConfig } from '../config/clinic';

export const FAQPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Frequently Asked Questions (FAQ)"
        description={`Find clear answers to common questions about appointments, dental services, and contacting the clinic at ${clinicConfig.name}.`}
      />
      <main>
        <section className="bg-navy-950 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest bg-navy-900 px-3.5 py-1.5 rounded-full border border-navy-800 inline-block mb-4">
              Help Center & Answers
            </span>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Have questions about your upcoming dental visit? Find fast, transparent answers below.
            </p>
          </div>
        </section>

        <FAQSection />
        <CTASection />
      </main>
    </>
  );
};
