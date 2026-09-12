import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';
import { getMainNavLinks, isSiteSectionEnabled, sectionRoutes, sectionLabels } from '../../config/siteSections';
import { fetchServicesList, ServiceRecord } from '../../services/serviceService';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const [services, setServices] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    if (!isSiteSectionEnabled('services')) return;
    let cancelled = false;
    fetchServicesList().then((rows) => {
      if (!cancelled) setServices(rows.filter((service) => service.active).slice(0, 7));
    });
    return () => { cancelled = true; };
  }, []);

  const links = getMainNavLinks();
  const legalLinks = (['privacy', 'terms'] as const)
    .filter(isSiteSectionEnabled)
    .map((section) => ({ label: sectionLabels[section], path: sectionRoutes[section] }));

  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-8 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-navy-800">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-500 to-medical-500 flex items-center justify-center text-white font-serif font-bold text-2xl" aria-hidden="true">
                {clinicConfig.logoText.charAt(0)}
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight text-white">
                {clinicConfig.logoText} <span className="text-brand-400 font-normal">{clinicConfig.logoSubtext}</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mt-5">{clinicConfig.tagline}.</p>
            <div className="mt-6 space-y-3 text-sm">
              {(clinicConfig.address || clinicConfig.city || clinicConfig.country) && (
                <div className="flex items-start gap-3">
                  <MapPin size={17} className="text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{[clinicConfig.address, clinicConfig.city, clinicConfig.country].filter(Boolean).join(', ')}{clinicConfig.postalCode ? ` ${clinicConfig.postalCode}` : ''}</span>
                </div>
              )}
              <a href={`tel:${clinicConfig.phone}`} className="flex items-center gap-3 hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded">
                <Phone size={17} className="text-brand-400" aria-hidden="true" /><span>{clinicConfig.phone}</span>
              </a>
              {clinicConfig.email && (
                <a href={`mailto:${clinicConfig.email}`} className="flex items-center gap-3 hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded break-all">
                  <Mail size={17} className="text-brand-400" aria-hidden="true" /><span>{clinicConfig.email}</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-serif font-bold text-white text-base mb-4">Quick Links</h2>
            <ul className="space-y-2.5">
              {links.map(({ name, path }) => (
                <li key={path}>
                  <Link to={path} className="text-sm text-slate-400 hover:text-brand-400 inline-flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                    <ArrowRight size={13} className="text-brand-500" aria-hidden="true" />{name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {isSiteSectionEnabled('services') && <div>
            <h2 className="font-serif font-bold text-white text-base mb-4">Dental Services</h2>
            <ul className="space-y-2.5">
              {services.map((service) => (
                <li key={service.id}>
                  <Link to={`/services/${service.id}`} className="text-sm text-slate-400 hover:text-brand-400 inline-flex rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                    {service.name}
                  </Link>
                </li>
              ))}
              {!services.length && <li className="text-sm text-slate-500">Browse the services page for current treatment information.</li>}
            </ul>
          </div>}
        </div>

        {legalLinks.length > 0 && (
          <div className="mt-6 flex justify-center gap-4 text-xs text-slate-500">
            {legalLinks.map(({ label, path }) => (
              <Link key={path} to={path} className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">{label}</Link>
            ))}
          </div>
        )}

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-slate-500">
          <p>© {year} {clinicConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {isSiteSectionEnabled('appointment') && <Link to="/appointment" className="text-brand-400 hover:text-brand-300 font-bold inline-flex items-center gap-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
              <Calendar size={14} aria-hidden="true" /> Book Appointment
            </Link>}
            {isSiteSectionEnabled('contact') && <Link to="/contact" className="hover:text-slate-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">Contact & Directions</Link>}
          </div>
        </div>
      </div>
      </footer>
  );
};
