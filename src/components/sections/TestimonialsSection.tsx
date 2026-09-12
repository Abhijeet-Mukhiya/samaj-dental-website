import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareQuote } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';
import { SectionHeading } from '../ui/SectionHeading';
import { TestimonialCard } from '../cards/TestimonialCard';

export const TestimonialsSection: React.FC = () => {
  if (!clinicConfig.testimonials.length) {
    return (
      <section className="py-24 bg-white" aria-labelledby="reviews-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            badgeText="Patient Feedback"
            title="Patient reviews"
            subtitle="Verified patient feedback will appear here once the clinic provides approved reviews."
          />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-5 py-3 text-sm text-navy-700">
            <MessageSquareQuote size={18} className="text-brand-600" aria-hidden="true" />
            <span>Patient reviews are intentionally omitted from this universal demo. Add clinic-approved feedback here after permission is obtained.</span>
          </div>
          <div className="mt-6">
            <Link to="/contact" className="inline-flex rounded-full bg-navy-900 text-white px-6 py-3 text-sm font-semibold hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
              Contact the Clinic
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white" aria-labelledby="reviews-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badgeText="Sample Demonstration Content"
          title="How patient feedback can appear"
          subtitle="Sample content is shown here only to demonstrate the layout. Replace it with clinic-approved feedback before launch."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {clinicConfig.testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};
