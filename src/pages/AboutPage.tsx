import React from 'react';
import { SEO } from '../components/ui/SEO';
import { AboutSection } from '../components/sections/AboutSection';
import { TrustStatsSection } from '../components/sections/TrustStatsSection';
import { DoctorsSection } from '../components/sections/DoctorsSection';
import { CTASection } from '../components/sections/CTASection';
import { clinicConfig } from '../config/clinic';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <>
      <SEO
        title="About Our Practice"
        description={`Learn more about ${clinicConfig.name}, its services, patient-focused approach, and verified clinic information.`}
      />
      <main>
        {/* Page Hero Header */}
        <section className="bg-navy-950 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest bg-navy-900 px-3.5 py-1.5 rounded-full border border-navy-800 inline-block mb-4">
              Gentle & Advanced Dentistry
            </span>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4">
              About {clinicConfig.name}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              A polished template for presenting a clinic’s verified story, services, and patient-focused approach.
            </p>
          </div>
        </section>

        <TrustStatsSection />
        <AboutSection />

        {/* Technology Highlights */}
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider block w-fit mx-auto mb-3">
                Modern Diagnostics
              </span>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-navy-900 mb-4">
                Dental Technology & Facilities
              </h2>
              <p className="text-navy-600 text-sm md:text-base leading-relaxed">
                Add only verified equipment, technology, and clinical claims supplied by the clinic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {clinicConfig.about.technology.map((tech, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-7 shadow-soft border border-slate-100 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="font-serif font-bold text-navy-900 text-xl">{tech.title}</h3>
                  <p className="text-navy-600 text-sm leading-relaxed">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <DoctorsSection />
        <CTASection />
      </main>
    </>
  );
};
