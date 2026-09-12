import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Calendar, ArrowLeft, CheckCircle2, UserRound, Clock } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { CTASection } from '../components/sections/CTASection';
import { fetchDoctorsList, DoctorRecord } from '../services/doctorService';
import { isSiteSectionEnabled } from '../config/siteSections';

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDoctorsList().then((rows) => {
      if (!cancelled) {
        setDoctor(rows.find((row) => row.id === id && row.active) || null);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <main className="min-h-[50vh] flex items-center justify-center text-sm text-slate-500">Loading doctor profile...</main>;
  }

  if (!doctor) return <Navigate to="/doctors" replace />;

  const initials = doctor.name.replace(/^Dr\.\s*/i, '').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <>
      <SEO title={`${doctor.name} – ${doctor.specialization}`} description={doctor.bio || `View the clinical profile of ${doctor.name}.`} />
      <main className="bg-slate-50/50">
        <section className="bg-navy-950 text-white py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/doctors" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-brand-400 mb-6">
              <ArrowLeft size={14} /> <span>Back to All Doctors</span>
            </Link>
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
              {doctor.specialization}
            </span>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight mt-4 mb-2">{doctor.name}</h1>
            <p className="text-slate-300 text-base">{doctor.title || "Clinical team member"}</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl overflow-hidden shadow-soft border-4 border-white bg-slate-100 aspect-[4/5]">
                {doctor.image ? (
                  <img src={doctor.image} alt={doctor.name} loading="lazy" width="600" height="750" className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 text-brand-700">
                    <div className="w-24 h-24 rounded-full bg-white border border-brand-100 shadow-sm flex items-center justify-center text-2xl font-bold">
                      {initials || <UserRound size={38} />}
                    </div>
                    <span className="mt-3 text-xs font-semibold">Sample profile image</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-brand-500 shrink-0 mt-0.5" />
                  <div><span className="text-xs text-slate-400 block">Clinic schedule</span><span className="font-semibold text-navy-900">{doctor.availableDays.join(', ') || 'Schedule to be added'}</span></div>
                </div>
                {isSiteSectionEnabled('appointment') && <Link to="/appointment" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm">
                  <Calendar size={16} /> <span>Book Consultation</span>
                </Link>}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-4">
                <h2 className="font-serif font-bold text-2xl text-navy-900">About {doctor.name}</h2>
                <p className="text-navy-700 text-base leading-relaxed">
                  {doctor.bio || 'The clinic can add a verified professional biography here from the admin dashboard.'}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-5">
                <h2 className="font-serif font-bold text-2xl text-navy-900">Profile information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 size={18} className="text-brand-500" />
                    <div><span className="text-xs text-slate-400 block">Specialization</span><span className="text-sm font-semibold text-navy-800">{doctor.specialization}</span></div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 size={18} className="text-brand-500" />
                    <div><span className="text-xs text-slate-400 block">Status</span><span className="text-sm font-semibold text-navy-800">{doctor.active ? 'Active clinic profile' : 'Inactive'}</span></div>
                  </div>
                  {doctor.qualification && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 size={18} className="text-brand-500" />
                      <div><span className="text-xs text-slate-400 block">Professional details</span><span className="text-sm font-semibold text-navy-800">{doctor.qualification}</span></div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">Professional qualifications, memberships, languages and other credentials should only be published after the clinic provides and verifies them.</p>
              </div>
            </div>
          </div>
        </div>

        <CTASection />
      </main>
    </>
  );
};
