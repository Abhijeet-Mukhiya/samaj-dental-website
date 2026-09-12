import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { Testimonial } from '../../types/clinic';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100/90 flex flex-col justify-between relative hover:shadow-soft-xl transition-all duration-300 hover-glow">
      {/* Decorative Large Background Quote */}
      <div className="absolute top-6 right-6 text-slate-100 pointer-events-none">
        <Quote size={56} />
      </div>

      <div className="relative z-10">
        {/* Rating Stars & Verified Tag */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={16}
                fill={index < testimonial.rating ? 'currentColor' : 'none'}
                className={index < testimonial.rating ? 'text-amber-400' : 'text-slate-200'}
              />
            ))}
          </div>

          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full flex items-center space-x-1 uppercase tracking-wider">
            <CheckCircle2 size={11} className="text-emerald-600" />
            <span>Verified Patient</span>
          </span>
        </div>

        {/* Testimonial Quote Body */}
        <p className="text-navy-800 text-sm md:text-base leading-relaxed italic mb-6">
          "{testimonial.text}"
        </p>
      </div>

      {/* Patient Avatar & Metadata */}
      <div className="pt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3.5">
          {testimonial.patientImage ? (
            <img
              src={testimonial.patientImage}
              alt={testimonial.patientName} loading="lazy" width="80" height="80"
              className="w-12 h-12 rounded-full object-cover border-2 border-brand-200 shadow-xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-medical-500 text-white font-bold font-serif flex items-center justify-center text-lg shadow-xs">
              {testimonial.patientName.charAt(0)}
            </div>
          )}
          <div>
            <h4 className="font-serif font-bold text-navy-900 text-base leading-tight">
              {testimonial.patientName}
            </h4>
            <span className="text-xs text-brand-600 font-semibold block">{testimonial.treatmentName}</span>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">
          {testimonial.date}
        </span>
      </div>
    </div>
  );
};
