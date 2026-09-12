import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/ui/SEO';
import { clinicConfig } from '../config/clinic';
import { isSiteSectionEnabled } from '../config/siteSections';

export const PrivacyPage: React.FC = () => (
  <>
    <SEO title="Privacy Policy" description={`Privacy information for ${clinicConfig.name}.`} />
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-soft-xl">
        <p className="text-brand-700 font-bold text-sm uppercase tracking-wider">Privacy</p>
        <h1 className="font-serif text-4xl font-bold text-navy-900 mt-3">Privacy Policy</h1>
        <p className="mt-5 text-slate-600 leading-8">This demo site is designed to collect only the information needed to respond to an appointment request. Do not submit medical records, diagnoses, payment information, passwords, or other sensitive information through this form.</p>
        <h2 className="font-serif text-2xl font-bold text-navy-900 mt-10">Information you provide</h2>
        <p className="mt-3 text-slate-600 leading-8">Appointment requests may include your name, phone number, email address, preferred date/time, selected service, preferred dentist, and an optional message. The connected demo can transmit appointment requests to the configured backend for clinic-side handling. Only use real patient information after the clinic has approved its privacy notice and production data-handling setup.</p>
        <h2 className="font-serif text-2xl font-bold text-navy-900 mt-10">Important limitation</h2>
        <p className="mt-3 text-slate-600 leading-8">This is a demonstration template, not a substitute for a clinic's final privacy notice. A real deployment should publish a clinic-approved privacy policy and configure a secure backend before collecting patient information.</p>
        {isSiteSectionEnabled('appointment') && (
          <Link to="/appointment" className="inline-flex mt-8 rounded-xl bg-brand-600 text-white font-bold px-5 py-3">Request an appointment</Link>
        )}
      </div>
    </main>
  </>
);
