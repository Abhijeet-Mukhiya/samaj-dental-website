import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Phone, Sparkles } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';
import { isSiteSectionEnabled } from '../../config/siteSections';

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-tr from-navy-950 via-navy-900 to-navy-950 text-white relative overflow-hidden">
      {/* Glow shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-medical-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        
        <div className="inline-flex items-center space-x-2 bg-navy-800/80 border border-navy-700 px-4 py-1.5 rounded-full text-xs font-medium text-brand-300">
          <Sparkles size={14} className="text-brand-400" />
          <span>Start Your Journey to a Healthier Smile Today</span>
        </div>

        <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight max-w-3xl mx-auto">
          Ready to Experience Exceptional Dental Care?
        </h2>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Request an appointment online or contact the clinic directly. We look forward to welcoming you to {clinicConfig.name}.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isSiteSectionEnabled('appointment') && <Link
            to="/appointment"
            className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-brand-500/30 hover:shadow-xl transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
          >
            <Calendar size={18} />
            <span>Book an Appointment</span>
          </Link>}

          {clinicConfig.phone && <a
            href={`tel:${clinicConfig.phone}`}
            className="w-full sm:w-auto bg-navy-800/90 hover:bg-navy-800 text-white font-semibold px-8 py-4 rounded-full border border-navy-700 hover:border-brand-400 transition-all flex items-center justify-center space-x-2"
          >
            <Phone size={18} className="text-brand-400" />
            <span>Call {clinicConfig.phone}</span>
          </a>}
        </div>

        <p className="text-xs text-slate-400 pt-2">
          Appointment requests are subject to clinic availability and confirmation.
        </p>

      </div>
    </section>
  );
};
