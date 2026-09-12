import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Calendar, Clock, DollarSign, CheckCircle2, ArrowLeft, Phone, ShieldCheck, HelpCircle } from 'lucide-react';
import { clinicConfig } from '../config/clinic';
import { isSiteSectionEnabled } from '../config/siteSections';
import { fetchServicesList, serviceRecordToDisplayService } from '../services/serviceService';
import { SEO } from '../components/ui/SEO';
import { getLucideIcon } from '../utils/helpers';
import { CTASection } from '../components/sections/CTASection';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<import('../types/clinic').Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadService() {
      const rows = await fetchServicesList();
      const record = rows.find((row) => row.id === id && row.active);
      if (!cancelled) {
        setService(record ? serviceRecordToDisplayService(record) : null);
        setLoading(false);
      }
    }
    loadService();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <main className="min-h-[50vh] flex items-center justify-center text-sm text-slate-500">Loading service details...</main>;
  }

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <>
      <SEO
        title={service.title}
        description={service.shortDescription}
      />
      <main className="bg-slate-50/50">
        
        {/* Header Banner */}
        <section className="bg-navy-950 text-white py-14 md:py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link
              to="/services"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-brand-400 mb-6 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to All Services</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                {service.category} Dentistry
              </span>
            </div>

            <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4">
              {service.title}
            </h1>
            <p className="text-slate-300 text-base max-w-3xl leading-relaxed">
              {service.shortDescription}
            </p>
          </div>
        </section>

        {/* Content Body & Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Image Frame */}
              <div className="rounded-3xl overflow-hidden shadow-soft border border-slate-100 aspect-[16/9] bg-slate-100">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  width="1200"
                  height="675"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Full Description */}
              <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-4">
                <h2 className="font-serif font-bold text-2xl text-navy-900">Treatment Overview</h2>
                <p className="text-navy-700 text-base leading-relaxed">{service.fullDescription}</p>
              </div>

              {/* Benefits Section */}
              <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-6">
                <h2 className="font-serif font-bold text-2xl text-navy-900">Key Patient Benefits</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-xl bg-brand-50/50 border border-brand-100/60">
                      <CheckCircle2 size={18} className="text-brand-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-navy-800">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Procedure */}
              <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-6">
                <h2 className="font-serif font-bold text-2xl text-navy-900">What to Expect During Procedure</h2>
                <div className="space-y-4">
                  {service.procedures.map((proc, idx) => (
                    <div key={idx} className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-navy-900 text-white font-bold font-serif flex items-center justify-center shrink-0 text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-navy-900 text-base">{proc.title}</h4>
                        <p className="text-navy-600 text-sm mt-1">{proc.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Specific FAQs */}
              {service.faqs && service.faqs.length > 0 && (
                <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-6">
                  <h2 className="font-serif font-bold text-2xl text-navy-900">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {service.faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <h4 className="font-serif font-bold text-navy-900 text-base mb-1 flex items-center space-x-2">
                          <HelpCircle size={16} className="text-brand-500" />
                          <span>{faq.question}</span>
                        </h4>
                        <p className="text-navy-600 text-sm leading-relaxed pl-6">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Quick Spec Card */}
              <div className="bg-white rounded-3xl p-7 shadow-soft border border-slate-100 space-y-6 sticky top-24">
                <h3 className="font-serif font-bold text-navy-900 text-xl border-b border-slate-100 pb-4">
                  Treatment Details
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center space-x-2">
                      <Clock size={16} className="text-brand-500" />
                      <span>Duration:</span>
                    </span>
                    <span className="font-semibold text-navy-900">{service.duration}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center space-x-2">
                      <DollarSign size={16} className="text-brand-500" />
                      <span>Estimated Cost:</span>
                    </span>
                    <span className="font-semibold text-brand-700">{service.priceRange}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center space-x-2">
                      <ShieldCheck size={16} className="text-brand-500" />
                      <span>Category:</span>
                    </span>
                    <span className="font-semibold text-navy-900">{service.category}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  {isSiteSectionEnabled('appointment') && <Link
                    to="/appointment"
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <Calendar size={16} />
                    <span>Book This Procedure</span>
                  </Link>}

                  {clinicConfig.phone && <a
                    href={`tel:${clinicConfig.phone}`}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-navy-800 font-semibold py-3.5 px-4 rounded-xl border border-slate-200 transition-colors flex items-center justify-center space-x-2 text-xs"
                  >
                    <Phone size={15} className="text-brand-500" />
                    <span>Questions? Call Us</span>
                  </a>}
                </div>
              </div>

            </div>

          </div>
        </div>

        <CTASection />
      </main>
    </>
  );
};
