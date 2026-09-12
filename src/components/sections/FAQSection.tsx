import React from 'react';
import { clinicConfig } from '../../config/clinic';
import { SectionHeading } from '../ui/SectionHeading';
import { FAQAccordion } from '../cards/FAQAccordion';

export const FAQSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badgeText="Got Questions?"
          title="Frequently Asked Questions"
          subtitle="Find clear answers regarding appointment scheduling, dental services, and contacting the clinic."
        />

        <FAQAccordion items={clinicConfig.faqs} />
      </div>
    </section>
  );
};
