import React from 'react';
import { SEO } from '../components/ui/SEO';
import { clinicConfig } from '../config/clinic';

export const TermsPage: React.FC = () => (
  <>
    <SEO title="Terms & Appointment Notice" description={`Appointment and website terms for ${clinicConfig.name}.`} />
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-soft-xl">
        <p className="text-brand-700 font-bold text-sm uppercase tracking-wider">Terms</p>
        <h1 className="font-serif text-4xl font-bold text-navy-900 mt-3">Appointment & Website Notice</h1>
        <ul className="mt-7 space-y-4 text-slate-600 leading-7 list-disc pl-5">
          <li>An appointment request is not an appointment confirmation.</li>
          <li>The clinic must confirm availability, timing, and treatment suitability directly.</li>
          <li>Information on this demo is general and should not be treated as medical advice.</li>
          <li>Only publish clinic-specific hours, prices, credentials, reviews, and claims after they have been verified by the clinic.</li>
          <li>For urgent concerns, contact the clinic directly rather than relying on the website form.</li>
        </ul>
        <p className="mt-8 text-sm text-slate-500">These are template notices and should be reviewed and adapted by the clinic before production use.</p>
      </div>
    </main>
  </>
);
