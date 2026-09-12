import React from 'react';
import { SEO } from '../components/ui/SEO';
import { AppointmentForm } from '../components/sections/AppointmentForm';
import { CTASection } from '../components/sections/CTASection';
import { clinicConfig } from '../config/clinic';
import { Calendar, Phone, Clock, ShieldCheck } from 'lucide-react';

export const AppointmentPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Book an Appointment Online"
        description={`Schedule your dental appointment at ${clinicConfig.name}. Select your preferred doctor, time slot, and treatment.`}
      />
      <main className="bg-slate-50/50">
        
        {/* Header */}
        <section className="bg-navy-950 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest bg-navy-900 px-3.5 py-1.5 rounded-full border border-navy-800 inline-block mb-4">
              Online Scheduling
            </span>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4">
              Book Your Visit to {clinicConfig.name}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Choose a preferred date and time, tell us what you need, and send an appointment request. The clinic will contact you to confirm availability.
            </p>
          </div>
        </section>

        {/* Appointment Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Form */}
              <div className="lg:col-span-8">
                <AppointmentForm />
              </div>

              {/* Right Column: Why Book & Hours Widget */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-3xl p-7 shadow-soft border border-slate-100 space-y-4">
                  <h3 className="font-serif font-bold text-navy-900 text-xl flex items-center space-x-2">
                    <ShieldCheck className="text-brand-500" size={22} />
                    <span>Why Contact the Clinic</span>
                  </h3>
                  <ul className="space-y-3 text-sm text-navy-700">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
                      <span>Request an appointment at a time that suits you</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
                      <span>Discuss your dental needs with the clinic</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
                      <span>Ask the clinic about current treatment pricing</span>
                    </li>
                  </ul>
                </div>

                {/* Direct Reception Card */}
                <div className="bg-navy-900 text-white rounded-3xl p-7 shadow-soft border border-navy-800 space-y-4">
                  <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                    <Phone className="text-brand-400" size={20} />
                    <span>Prefer Booking by Phone?</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Call our friendly receptionists directly during office hours for appointment availability and booking assistance.
                  </p>
                  {clinicConfig.phone && <a
                    href={`tel:${clinicConfig.phone}`}
                    className="block w-full bg-brand-600 hover:bg-brand-700 text-center text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    {clinicConfig.phone}
                  </a>}
                </div>
              </div>

            </div>
          </div>
        </section>

        <CTASection />
      </main>
    </>
  );
};
