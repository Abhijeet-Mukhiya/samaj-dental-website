import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, Calendar, X, Sparkles } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';
import { isSiteSectionEnabled } from '../../config/siteSections';

export const StickyActionBar: React.FC = () => {
  const [desktopDismissed, setDesktopDismissed] = useState(false);

  return (
    <>
      {/* MOBILE STICKY ACTION BAR (Visible on screens < md) */}
      <aside
        aria-label="Quick Mobile Actions"
        className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(15,23,42,0.1)] p-2.5 px-3"
      >
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          
          {/* Action 1: Call Clinic */}
          {clinicConfig.phone && <a
            href={`tel:${clinicConfig.phone}`}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-100/90 active:bg-slate-200 text-navy-900 text-[11px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label={`Call ${clinicConfig.name} reception`}
          >
            <Phone size={17} className="text-brand-600 mb-0.5" />
            <span>Call Us</span>
          </a>}

          {/* Action 2: WhatsApp Chat */}
          {clinicConfig.whatsapp && <a
            href={`https://wa.me/${clinicConfig.whatsapp}?text=${encodeURIComponent(clinicConfig.whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-emerald-50 active:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-emerald-200/60"
            aria-label="Chat with practice on WhatsApp"
          >
            <MessageSquare size={17} className="text-emerald-600 mb-0.5" />
            <span>WhatsApp</span>
          </a>}

          {/* Action 3: Book Appointment */}
          {isSiteSectionEnabled('appointment') && <Link
            to="/appointment"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 active:from-brand-700 active:to-brand-600 text-white text-[11px] font-bold shadow-md shadow-brand-500/20 transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Book a dental appointment online"
          >
            <Calendar size={17} className="mb-0.5" />
            <span>Book Visit</span>
          </Link>}

        </div>
      </aside>

      {/* DESKTOP SUBTLE FLOATING CTA WIDGET (Visible on screens >= md) */}
      {!desktopDismissed && (
        <div
          aria-label="Floating Appointment Reminder"
          className="fixed bottom-6 right-6 z-40 hidden md:flex items-center space-x-3.5 bg-navy-950 text-white p-2.5 pl-4 pr-3 rounded-full shadow-2xl border border-navy-700/80 hover:border-brand-500/50 transition-all duration-300 transform hover:-translate-y-1 group animate-fade-in"
        >
          {/* Live Pulse & Label */}
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot" />
            <div className="text-xs">
              <span className="font-bold block text-white leading-none">Need Dental Care?</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Contact the clinic directly</span>
            </div>
          </div>

          {/* Call Shortcut */}
          {clinicConfig.phone && <a
            href={`tel:${clinicConfig.phone}`}
            className="p-2 rounded-full bg-navy-900 hover:bg-brand-600 text-slate-300 hover:text-white transition-colors"
            title={`Call ${clinicConfig.phone}`}
            aria-label="Call clinic reception"
          >
            <Phone size={14} className="text-brand-300 group-hover:text-white" aria-hidden="true" />
          </a>}

          {/* Book CTA Button */}
          {isSiteSectionEnabled('appointment') && <Link
            to="/appointment"
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-md shadow-brand-500/30 transition-all flex items-center space-x-1.5 uppercase tracking-wider"
          >
            <Calendar size={13} />
            <span>Book Slot</span>
          </Link>}

          {/* Dismiss Button */}
          <button
            onClick={() => setDesktopDismissed(true)}
            className="p-1 rounded-full text-slate-500 hover:text-slate-300 hover:bg-navy-900 transition-colors"
            aria-label="Dismiss floating appointment bar"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
};
