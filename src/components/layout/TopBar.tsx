import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';

export const TopBar: React.FC = () => (
  <div className="bg-navy-950 text-slate-300 text-xs py-2.5 border-b border-navy-800/80 hidden md:block">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
        {clinicConfig.phone && (
          <a href={`tel:${clinicConfig.phone}`} className="flex items-center gap-1.5 hover:text-brand-400 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded">
            <Phone size={13} className="text-brand-400" aria-hidden="true" />
            <span>{clinicConfig.phone}</span>
          </a>
        )}
        </div>
        {(clinicConfig.address || clinicConfig.city || clinicConfig.country) && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin size={13} className="text-brand-400" aria-hidden="true" />
            <span>{[clinicConfig.address, clinicConfig.city, clinicConfig.country].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);
