import React from 'react';
import { StatItem } from '../../types/clinic';
import { getLucideIcon } from '../../utils/helpers';

interface StatCardProps {
  stat: StatItem;
}

/* DEMO STATISTIC CARD COMPONENT
 * Note: Metric values originate from clinicConfig.stats and must be updated
 * with verified clinic statistics before deploying to production.
 */
export const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-soft-xl transition-all duration-300 flex items-center space-x-5 group transform hover:-translate-y-1">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300 shrink-0 shadow-xs">
        {getLucideIcon(stat.iconName, { className: 'w-7 h-7' })}
      </div>
      <div>
        <div className="font-serif font-bold text-3xl md:text-4xl text-navy-900 tracking-tight group-hover:text-brand-600 transition-colors">
          {stat.value}
        </div>
        <div className="font-semibold text-navy-800 text-sm mt-0.5">{stat.label}</div>
        <div className="text-slate-500 text-xs mt-1">{stat.subtext}</div>
      </div>
    </div>
  );
};
