import React from 'react';
import { clinicConfig } from '../../config/clinic';
import { StatCard } from '../cards/StatCard';

export const TrustStatsSection: React.FC = () => {
  if (!clinicConfig.stats.length) return null;

  return (
    <section
      aria-label="Verified clinic information"
      className="py-12 bg-white border-y border-slate-100 relative z-20 -mt-8 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl shadow-soft"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {clinicConfig.stats.map((stat) => <StatCard key={stat.id} stat={stat} />)}
      </div>
    </section>
  );
};
