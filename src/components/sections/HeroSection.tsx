import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Sparkles, Phone, CheckCircle2 } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';
import { isSiteSectionEnabled } from '../../config/siteSections';

export const HeroSection: React.FC = () => {
  const { hero } = clinicConfig;

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-brand-50/15 to-white pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden" aria-labelledby="hero-title">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-200/25 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-medical-200/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-brand-200 shadow-xs text-xs font-semibold text-brand-700">
                <Sparkles size={14} className="text-brand-500" aria-hidden="true" />
                <span>{hero.trustBadge}</span>
              </div>

              {hero.ratingText && (
                <div className="inline-flex items-center gap-2 bg-white/90 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-navy-700">
                  <CheckCircle2 size={13} className="text-brand-600" aria-hidden="true" />
                  <span>{hero.ratingText}</span>
                </div>
              )}
            </div>

            <h1 id="hero-title" className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-navy-900 tracking-tight leading-[1.1]">
              {hero.headline.split('.').map((part, idx) => (
                <span key={idx} className={idx === 0 ? 'block' : 'text-gradient block mt-1'}>
                  {part}{part && '.'}
                </span>
              ))}
            </h1>

            <p className="text-navy-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {hero.subheadline}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {isSiteSectionEnabled('appointment') && <Link
                to="/appointment"
                className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold text-sm px-8 py-4 rounded-full shadow-lg transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                <Calendar size={18} aria-hidden="true" />
                <span>{hero.primaryCtaText}</span>
              </Link>}

              {isSiteSectionEnabled('services') && <Link
                to="/services"
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-navy-800 font-semibold text-sm px-8 py-4 rounded-full border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                <span>{hero.secondaryCtaText}</span>
                <ArrowRight size={16} className="text-brand-600" aria-hidden="true" />
              </Link>}
            </div>

            {hero.trustIndicators.length > 0 && (
              <div className="pt-6 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left" aria-label="Clinic features">
                {hero.trustIndicators.map((indicator, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/70 p-2 rounded-xl border border-slate-100">
                    <CheckCircle2 size={15} className="text-brand-500 shrink-0" aria-hidden="true" />
                    <span className="text-xs font-semibold text-navy-800">{indicator}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-tr from-brand-500/20 via-medical-400/20 to-transparent blur-lg opacity-70" aria-hidden="true" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] lg:aspect-[4/5] bg-slate-100">
                <img
                  src={hero.heroImage}
                  alt={`${clinicConfig.name} dental clinic`}
                  className="w-full h-full object-cover"
                  width="1200"
                  height="1500"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent" aria-hidden="true" />
              </div>

              <div className="absolute -bottom-6 -left-6 sm:bottom-6 sm:-left-8 bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-100/80 max-w-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} aria-hidden="true" />
                </div>
                <div>
                  <div className="font-serif font-bold text-navy-900 text-base">Patient-focused care</div>
                  <div className="text-xs text-slate-500">Contact the clinic to discuss your needs.</div>
                </div>
              </div>

              {clinicConfig.phone && <a
                href={`tel:${clinicConfig.phone}`}
                className="absolute -top-4 -right-4 sm:top-6 sm:-right-6 bg-navy-900 text-white p-3.5 px-4 rounded-2xl shadow-xl border border-navy-700/80 flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                aria-label={`Call ${clinicConfig.name} at ${clinicConfig.phone}`}
              >
                <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
                  <Phone size={18} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Call the clinic</div>
                  <span className="text-xs font-bold text-brand-300">{clinicConfig.phone}</span>
                </div>
              </a>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
