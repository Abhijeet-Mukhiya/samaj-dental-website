import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, Navigation, MessageSquare } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';

export const MapContactSection: React.FC = () => (
  <section className="py-20 bg-white" aria-labelledby="location-heading">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider block w-fit mb-3">
              Visit the Clinic
            </span>
            <h2 id="location-heading" className="font-serif font-bold text-3xl sm:text-4xl text-navy-900 mb-4 leading-tight">
              Find {clinicConfig.name} in {clinicConfig.city}
            </h2>
            <p className="text-navy-600 text-sm leading-relaxed">
              Contact the clinic directly for directions, opening hours, and appointment availability.
            </p>
          </div>

          <div className="space-y-4">
            {(clinicConfig.address || clinicConfig.city || clinicConfig.country) && (
              <InfoCard icon={<MapPin size={20} aria-hidden="true" />} title="Location">
                <p>{[clinicConfig.address, clinicConfig.city, clinicConfig.country].filter(Boolean).join(', ')}{clinicConfig.postalCode ? ` ${clinicConfig.postalCode}` : ''}</p>
              </InfoCard>
            )}

            {clinicConfig.phone && (
              <InfoCard icon={<Phone size={20} aria-hidden="true" />} title="Phone">
                <a href={`tel:${clinicConfig.phone}`} className="font-medium hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded">
                  {clinicConfig.phone}
                </a>
              </InfoCard>
            )}

            {clinicConfig.openingHours.length > 0 && (
              <InfoCard icon={<Clock size={20} aria-hidden="true" />} title="Opening Hours">
                <div className="space-y-1">
                  {clinicConfig.openingHours.map((schedule) => (
                    <div key={schedule.day} className="flex justify-between gap-4">
                      <span>{schedule.day}</span><span className="font-medium">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </InfoCard>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {clinicConfig.directionsUrl && <a
              href={clinicConfig.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold px-5 py-3.5 rounded-full shadow-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <Navigation size={16} className="text-brand-400" aria-hidden="true" />
              <span>Get Directions</span>
              <ExternalLink size={14} className="text-slate-400" aria-hidden="true" />
            </a>}
            {clinicConfig.whatsapp && <a
              href={`https://wa.me/${clinicConfig.whatsapp}?text=${encodeURIComponent(clinicConfig.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-5 py-3.5 rounded-full border border-emerald-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <MessageSquare size={16} aria-hidden="true" />
              WhatsApp
            </a>}
          </div>
        </div>

        <div className="lg:col-span-7">
          {clinicConfig.mapsEmbedUrl ? (
            <div className="relative rounded-3xl overflow-hidden shadow-soft-xl border-4 border-slate-100 aspect-[4/3] lg:h-[540px] bg-slate-100">
              <iframe
                title={`${clinicConfig.name} location map`}
                src={clinicConfig.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-50 border border-slate-200 min-h-[360px] lg:h-[540px] flex items-center justify-center p-8 text-center">
              <div className="max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-5">
                  <MapPin size={30} aria-hidden="true" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-navy-900">{clinicConfig.address}, {clinicConfig.city}</h3>
                <p className="text-sm text-navy-600 mt-2">Use Google Maps to get directions to the clinic.</p>
                {clinicConfig.directionsUrl && (
                  <a href={clinicConfig.directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex mt-5 rounded-full bg-brand-600 text-white px-6 py-3 font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
                    Open Google Maps
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
);

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <h3 className="font-serif font-bold text-navy-900 text-sm">{title}</h3>
        <div className="text-navy-600 text-xs mt-1 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
