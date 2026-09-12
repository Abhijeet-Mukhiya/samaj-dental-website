import React from 'react';
import { SEO } from '../components/ui/SEO';
import { MapContactSection } from '../components/sections/MapContactSection';
import { AppointmentForm } from '../components/sections/AppointmentForm';
import { CTASection } from '../components/sections/CTASection';
import { clinicConfig } from '../config/clinic';

export const ContactPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Contact Us & Clinic Location"
        description={`Get in touch with ${clinicConfig.name}. View map directions, opening hours, reception phone numbers, and submit an online inquiry.`}
      />
      <main className="bg-slate-50/50">
        <section className="bg-navy-950 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest bg-navy-900 px-3.5 py-1.5 rounded-full border border-navy-800 inline-block mb-4">
              Get In Touch
            </span>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4">
              Contact the Clinic
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              We are here to assist with appointments, general questions, and contacting the clinic.
            </p>
          </div>
        </section>

        <MapContactSection />

        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                Send a Message
              </span>
              <h2 className="font-serif font-bold text-3xl text-navy-900">
                Schedule a Consultation or Inquiry
              </h2>
            </div>

            <AppointmentForm />
          </div>
        </section>

        <CTASection />
      </main>
    </>
  );
};
