import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';
import { isSiteSectionEnabled } from '../../config/siteSections';
import { SectionHeading } from '../ui/SectionHeading';
import { getLucideIcon } from '../../utils/helpers';

export const AboutSection: React.FC = () => {
  const { about } = clinicConfig;

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
          
          {/* Left Column: Images Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-soft-xl border-4 border-slate-50 aspect-[4/3] bg-slate-100">
              <img
                src={about.clinicImage}
                alt="Samaj Dental Care Clinic interior"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Overlapping Secondary Image */}
            <div className="absolute -bottom-8 -right-4 sm:-bottom-10 sm:-right-8 w-1/2 rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-square bg-slate-100 hidden sm:block">
              <img
                src={about.secondaryImage}
                alt="Dental care consultation"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Column: Bio & Mission */}
          <div className="lg:col-span-6 space-y-6">
            <SectionHeading
              badgeText="Our Practice Story"
              title={about.subtitle}
              alignment="left"
            />

            <p className="text-navy-700 text-base leading-relaxed">
              {about.story}
            </p>

            {/* Mission Box */}
            <div className="p-6 rounded-2xl bg-brand-50/60 border border-brand-100/80">
              <h4 className="font-serif font-bold text-navy-900 text-lg mb-2">Our Mission</h4>
              <p className="text-navy-700 text-sm leading-relaxed">{about.mission}</p>
            </div>

            {/* Key Features List */}
            <div className="space-y-2.5 pt-2">
              {about.features.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-sm font-semibold text-navy-800">
                  <CheckCircle2 size={18} className="text-brand-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {isSiteSectionEnabled('doctors') && <div className="pt-4">
              <Link
                to="/doctors"
                className="inline-flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold px-8 py-3.5 rounded-full shadow-md transition-all hover:shadow-lg"
              >
                <span>Meet Our Team</span>
                <ArrowRight size={16} className="text-brand-400" />
              </Link>
            </div>}
          </div>
        </div>

        {/* Core Values Cards */}
        <div className="mt-16 pt-16 border-t border-slate-100">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="font-serif font-bold text-2xl md:text-3xl text-navy-900 mb-3">
              Guided by Core Medical Values
            </h3>
            <p className="text-slate-600 text-sm">
              Every interaction at {clinicConfig.name} is shaped by our commitment to ethics, precision, and comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {about.values.map((val, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 rounded-2xl p-7 border border-slate-100 hover:border-brand-200 hover:bg-white hover:shadow-soft transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
                  {getLucideIcon(val.iconName, { className: 'w-6 h-6' })}
                </div>
                <h4 className="font-serif font-bold text-navy-900 text-lg mb-2">{val.title}</h4>
                <p className="text-navy-600 text-sm leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
