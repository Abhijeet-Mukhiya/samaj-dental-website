import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { DoctorCard } from '../cards/DoctorCard';
import { fetchDoctorsList, DoctorRecord } from '../../services/doctorService';

interface DoctorsSectionProps { limit?: number; }

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({ limit }) => {
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDoctorsList().then((rows) => {
      if (!cancelled) {
        setDoctors(rows.filter((doctor) => doctor.active));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const displayedDoctors = limit ? doctors.slice(0, limit) : doctors;

  return (
    <section className="py-20 bg-slate-50/50" aria-labelledby="team-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badgeText="Dental Team"
          title="Meet Our Dental Team"
          subtitle="Meet the dental professionals currently listed by the clinic."
        />

        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-sm text-slate-500" role="status">
            <Loader2 size={18} className="animate-spin text-brand-600" />
            Loading the clinical team...
          </div>
        ) : displayedDoctors.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedDoctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-5 py-3 text-sm text-navy-700">
              <Users size={18} className="text-brand-600" aria-hidden="true" />
              <span>The clinic team is being prepared for publication.</span>
            </div>
            <div className="mt-6">
              <Link to="/contact" className="inline-flex rounded-full bg-navy-900 text-white px-6 py-3 text-sm font-semibold hover:bg-navy-800">
                Contact the Clinic
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
