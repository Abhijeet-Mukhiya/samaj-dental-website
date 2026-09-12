import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, UserRound } from 'lucide-react';
import { DoctorRecord } from '../../services/doctorService';

interface DoctorCardProps {
  doctor: DoctorRecord;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const initials = doctor.name.replace(/^Dr\.\s*/i, '').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-slate-100/90 hover:border-brand-400/50 hover:shadow-soft-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1">
      <div>
        <div className="relative h-72 overflow-hidden bg-slate-100">
          {doctor.image ? (
            <img
              src={doctor.image}
              alt={`${doctor.name} — ${doctor.specialization}`}
              width={600}
              height={720}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 text-brand-700">
              <div className="w-20 h-20 rounded-full bg-white border border-brand-100 shadow-sm flex items-center justify-center">
                {initials || <UserRound size={32} />}
              </div>
              <span className="mt-3 text-xs font-semibold">Sample profile image</span>
            </div>
          )}
          <div className="absolute top-4 left-4 rounded-full bg-navy-950/80 text-white px-3 py-1 text-[10px] font-semibold tracking-wide border border-white/20">Fictional demo profile</div>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-[11px] font-semibold text-white bg-brand-600/90 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
              {doctor.specialization}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-serif font-bold text-xl text-navy-900 mb-1 group-hover:text-brand-600 transition-colors">
            {doctor.name}
          </h3>
          <p className="text-brand-700 text-xs font-bold uppercase tracking-wide mb-2">{doctor.title || doctor.specialization}</p>
          <p className="text-navy-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {doctor.bio || 'Clinical profile details can be added by the clinic administrator.'}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0 border-t border-slate-100/60 mt-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
          <Calendar size={13} className="text-brand-500" />
          <span>{doctor.availableDays.slice(0, 2).join(', ') || 'Schedule to be added'}</span>
        </div>

        <Link
          to={`/doctors/${doctor.id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-all"
        >
          <span>View Profile</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
