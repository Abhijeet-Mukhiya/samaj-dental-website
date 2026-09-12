import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { ServiceCard } from '../cards/ServiceCard';
import { fetchServicesList, serviceRecordToDisplayService, ServiceRecord } from '../../services/serviceService';

interface FeaturedServicesSectionProps {
  limit?: number;
  showCategoryFilter?: boolean;
}

export const FeaturedServicesSection: React.FC<FeaturedServicesSectionProps> = ({ limit, showCategoryFilter = true }) => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchServicesList().then((rows) => {
      if (!cancelled) {
        setServices(rows.filter((service) => service.active));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const displayServices = services.map(serviceRecordToDisplayService);
  const categories = ['All', 'General', 'Cosmetic', 'Surgical', 'Orthodontics', 'Emergency'];
  const filteredServices = displayServices.filter((service) => selectedCategory === 'All' || service.category === selectedCategory);
  const displayedServices = limit ? filteredServices.slice(0, limit) : filteredServices;

  return (
    <section className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badgeText="Comprehensive Care"
          title="Dental Services"
          subtitle="Explore the services currently listed by the clinic. Treatment recommendations are made after professional assessment."
        />

        {showCategoryFilter && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  selectedCategory === cat ? 'bg-navy-900 text-white shadow-md' : 'bg-white text-navy-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-sm text-slate-500" role="status">
            <Loader2 size={18} className="animate-spin text-brand-600" /> Loading clinic services...
          </div>
        ) : displayedServices.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedServices.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500 py-12">No active services are currently listed.</p>
        )}

        {limit && (
          <div className="mt-12 text-center">
            <Link to="/services" className="inline-flex items-center space-x-2 bg-white hover:bg-slate-100 text-navy-900 font-semibold px-8 py-3.5 rounded-full border border-slate-200 shadow-sm transition-all hover:border-brand-400">
              <span>View All Treatments</span><ArrowRight size={16} className="text-brand-600" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
