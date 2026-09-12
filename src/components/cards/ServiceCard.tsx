import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { Service } from '../../types/clinic';
import { getLucideIcon } from '../../utils/helpers';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-3xl p-7 shadow-soft border border-slate-100/90 hover:border-brand-400/50 hover:shadow-soft-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1 relative overflow-hidden">
      
      {/* Subtle Hover Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-medical-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Category & Icon Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-50/80 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300 shadow-xs">
            {getLucideIcon(service.iconName, { className: 'w-7 h-7' })}
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100/80 text-navy-700 uppercase tracking-wider">
            {service.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-xl text-navy-900 mb-3 group-hover:text-brand-600 transition-colors">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-navy-600 text-sm leading-relaxed mb-6 line-clamp-3">
          {service.shortDescription}
        </p>
      </div>

      <div>
        {/* Duration & Price Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 mb-5">
          <span className="flex items-center space-x-1.5 font-medium text-slate-600">
            <Clock size={13} className="text-brand-500" />
            <span>{service.duration}</span>
          </span>
          <span className="flex items-center space-x-1 font-semibold text-brand-700 bg-brand-50/60 px-2.5 py-1 rounded-md">
            <Tag size={12} className="text-brand-500" />
            <span>{service.priceRange}</span>
          </span>
        </div>

        {/* Learn More CTA */}
        <Link
          to={`/services/${service.id}`}
          className="w-full inline-flex items-center justify-between space-x-2 text-sm font-semibold text-brand-600 group-hover:text-brand-700 bg-slate-50 group-hover:bg-brand-50/50 px-4 py-2.5 rounded-xl transition-all"
        >
          <span>Explore Treatment Details</span>
          <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
