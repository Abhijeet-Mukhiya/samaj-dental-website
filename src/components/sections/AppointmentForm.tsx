import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, AlertCircle, MessageSquare, Send, Loader2 } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';
import { buildAppointmentEmail, buildAppointmentWhatsApp } from '../../utils/appointmentService';
import { fetchAvailableTimeSlots, submitAppointmentRequest, TimeSlotOption } from '../../services/appointmentBackendService';
import { fetchDoctorsList, DoctorRecord } from '../../services/doctorService';
import { fetchServicesList, ServiceRecord } from '../../services/serviceService';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  serviceId: string;
  doctorId: string;
  message: string;
  consent: boolean;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const today = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().split('T')[0];
};

export const AppointmentForm: React.FC = () => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    preferredDate: today(),
    preferredTime: '',
    serviceId: '',
    doctorId: '',
    message: '',
    consent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'confirmed' | 'error'>('idle');
  const [serverError, setServerError] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlotOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [bookedAppointmentId, setBookedAppointmentId] = useState<string>('');

  const selectedService = services.find((service) => service.id === formData.serviceId);
  const selectedDoctor = doctors.find((doctor) => doctor.id === formData.doctorId);

  useEffect(() => {
    let cancelled = false;
    async function loadCatalog() {
      setCatalogLoading(true);
      const [serviceRows, doctorRows] = await Promise.all([fetchServicesList(), fetchDoctorsList()]);
      if (!cancelled) {
        const activeServices = serviceRows.filter((service) => service.active);
        const activeDoctors = doctorRows.filter((doctor) => doctor.active);
        setServices(activeServices);
        setDoctors(activeDoctors);
        setFormData((previous) => ({
          ...previous,
          serviceId: activeServices.some((service) => service.id === previous.serviceId)
            ? previous.serviceId
            : (activeServices[0]?.id || ''),
        }));
        setCatalogLoading(false);
      }
    }
    loadCatalog();
    return () => { cancelled = true; };
  }, []);

  // Dynamically load available slots from backend when date, doctor, or service changes
  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      setLoadingSlots(true);
      const slots = await fetchAvailableTimeSlots(formData.doctorId, formData.preferredDate, undefined, formData.serviceId);
      if (!cancelled) {
        setAvailableSlots(slots);
        setLoadingSlots(false);
        // Auto-select first available slot if current selection is not available
        const currentSlotAvailable = slots.some(s => s.time === formData.preferredTime && s.available);
        if (!currentSlotAvailable) {
          const firstAvailable = slots.find(s => s.available);
          if (firstAvailable) {
            setFormData(prev => ({ ...prev, preferredTime: firstAvailable.time }));
          } else {
            setFormData(prev => ({ ...prev, preferredTime: '' }));
          }
        }
      }
    }
    loadSlots();
    return () => { cancelled = true; };
  }, [formData.preferredDate, formData.doctorId, formData.serviceId]);

  const request = useMemo(() => ({
    fullName: formData.fullName,
    phone: formData.phone,
    email: formData.email,
    preferredDate: formData.preferredDate,
    preferredTime: formData.preferredTime,
    serviceName: selectedService?.name || 'Dental consultation',
    doctorName: selectedDoctor?.name,
    message: formData.message,
  }), [formData, selectedService, selectedDoctor]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!formData.fullName.trim()) next.fullName = 'Please enter your full name.';
    if (!formData.phone.trim()) {
      next.phone = 'Please enter a phone number so the clinic can contact you.';
    } else if (!/^[+()0-9\s./-]{7,20}$/.test(formData.phone.trim())) {
      next.phone = 'Please enter a valid phone number.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = 'Please enter a valid email address.';
    }
    if (!formData.preferredDate) {
      next.preferredDate = 'Please choose a preferred date.';
    } else {
      const selected = new Date(`${formData.preferredDate}T00:00:00`);
      const minimum = new Date();
      minimum.setHours(0, 0, 0, 0);
      if (selected < minimum) next.preferredDate = 'Please choose today or a future date.';
    }
    if (!formData.preferredTime) next.preferredTime = 'Please select an available time slot.';
    if (formData.message.length > 1000) next.message = 'Please keep the message under 1,000 characters.';
    if (!formData.consent) next.consent = 'Please agree to be contacted about this appointment request.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const update = (name: keyof FormData, value: string | boolean) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: undefined }));
    setServerError('');
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    setServerError('');

    const result = await submitAppointmentRequest({
      patientName: formData.fullName,
      patientPhone: formData.phone,
      patientEmail: formData.email,
      doctorId: formData.doctorId,
      serviceId: formData.serviceId,
      appointmentDate: formData.preferredDate,
      appointmentTime: formData.preferredTime,
      message: formData.message,
      contactConsent: formData.consent,
    });

    if (result.success) {
      setBookedAppointmentId(result.appointmentId || `APT-${Date.now().toString().slice(-6)}`);
      setStatus('confirmed');
    } else {
      setStatus('error');
      setServerError(result.error || 'Failed to submit appointment request. Please choose another time.');
      // Refresh slots in case of collision
      const refreshedSlots = await fetchAvailableTimeSlots(formData.doctorId, formData.preferredDate, undefined, formData.serviceId);
      setAvailableSlots(refreshedSlots);
    }
  };

  const reset = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      preferredDate: today(),
      preferredTime: '',
      serviceId: services[0]?.id || '',
      doctorId: '',
      message: '',
      consent: false,
    });
    setErrors({});
    setStatus('idle');
    setServerError('');
    setBookedAppointmentId('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft-xl border border-slate-100/90">
      <div className="mb-8 p-4 rounded-2xl bg-brand-50 border border-brand-100 text-sm text-navy-800">
        <p className="font-semibold text-navy-900">Check availability & request an appointment</p>
        <p className="mt-1 leading-relaxed">
          {clinicConfig.appointmentSettings.guaranteeNoticeText}
        </p>
      </div>

      {status === 'confirmed' ? (
        <div className="text-center py-8" role="status" aria-live="polite">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle size={36} aria-hidden="true" />
          </div>
          <span className="mt-4 inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            Ref ID: {bookedAppointmentId}
          </span>
          <h2 className="font-serif font-bold text-2xl text-navy-900 mt-3">Appointment Request Received</h2>
          <p className="text-navy-600 text-sm max-w-lg mx-auto mt-3 leading-relaxed">
            Your request has been securely received for <strong>{formData.preferredDate}</strong> at <strong>{formData.preferredTime}</strong>. The clinic team will contact you at <strong>{formData.phone}</strong> to confirm availability and timing. Your appointment is not confirmed until the clinic responds.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto text-xs space-y-1.5 text-navy-800">
            <p><strong>Patient:</strong> {formData.fullName}</p>
            <p><strong>Service:</strong> {selectedService?.name || 'Dental consultation'}</p>
            <p><strong>Doctor:</strong> {selectedDoctor?.name || 'Any available dentist'}</p>
            <p><strong>Date & Time:</strong> {formData.preferredDate} • {formData.preferredTime}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
            {clinicConfig.whatsapp && <a
              href={buildAppointmentWhatsApp(request, clinicConfig.whatsapp, clinicConfig.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <MessageSquare size={17} aria-hidden="true" />
              Contact the Clinic on WhatsApp
            </a>}
            {clinicConfig.email && (
              <a
                href={buildAppointmentEmail(request, clinicConfig.email, clinicConfig.name)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                <Mail size={17} aria-hidden="true" />
Email the Clinic
              </a>
            )}
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Make another booking
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate aria-describedby="appointment-help">
          <p id="appointment-help" className="text-xs text-slate-500 mb-6">
            Required fields are marked with <span aria-hidden="true">*</span>. Slots are updated in real-time.
          </p>

          {serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3" role="alert">
              <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Booking Conflict</p>
                <p className="mt-1 text-xs">{serverError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Full Name" id="fullName" icon={<User size={18} aria-hidden="true" />} error={errors.fullName} required>
              <input
                id="fullName" name="fullName" type="text" autoComplete="name" required
                value={formData.fullName} onChange={(e) => update('fullName', e.target.value)}
                placeholder="Your full name"
                aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                className={inputClass(Boolean(errors.fullName))}
              />
            </Field>

            <Field label="Phone Number" id="phone" icon={<Phone size={18} aria-hidden="true" />} error={errors.phone} required>
              <input
                id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required
                value={formData.phone} onChange={(e) => update('phone', e.target.value)}
                placeholder="+977 98XXXXXXXX"
                aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={inputClass(Boolean(errors.phone))}
              />
            </Field>

            <Field label="Email Address" id="email" icon={<Mail size={18} aria-hidden="true" />} error={errors.email}>
              <input
                id="email" name="email" type="email" autoComplete="email"
                value={formData.email} onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com" maxLength={254}
                aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined}
                className={inputClass(Boolean(errors.email))}
              />
            </Field>

            <Field label="Preferred Date" id="preferredDate" icon={<Calendar size={18} aria-hidden="true" />} error={errors.preferredDate} required>
              <input
                id="preferredDate" name="preferredDate" type="date" required min={today()}
                value={formData.preferredDate} onChange={(e) => update('preferredDate', e.target.value)}
                aria-invalid={Boolean(errors.preferredDate)} aria-describedby={errors.preferredDate ? 'preferredDate-error' : undefined}
                className={inputClass(Boolean(errors.preferredDate))}
              />
            </Field>
          </div>

          <fieldset className="mt-7">
            <div className="flex items-center justify-between mb-3">
              <legend className="block text-xs font-bold text-navy-800 uppercase tracking-wider">
                Available Time Slots <span aria-hidden="true">*</span>
              </legend>
              {loadingSlots && <span className="text-xs text-brand-600 font-semibold flex items-center gap-1"><Loader2 size={13} className="animate-spin" /> Checking availability...</span>}
            </div>
            {errors.preferredTime && <p className="text-xs text-red-600 mb-2" role="alert">{errors.preferredTime}</p>}
            {availableSlots.length === 0 && !loadingSlots ? (
              <p className="col-span-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600" role="status">
                No available time slots were found for this date. Please choose another date or dentist.
              </p>
            ) : null}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => {
                const selected = formData.preferredTime === slot.time;
                return (
                  <button
                    key={slot.time} type="button" aria-pressed={selected} disabled={!slot.available}
                    onClick={() => update('preferredTime', slot.time)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
                      !slot.available
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        : selected
                        ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                        : 'bg-slate-50 text-navy-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Clock size={13} aria-hidden="true" />
                    <span>{slot.time}</span>
                    {!slot.available && <span className="sr-only">(Booked)</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-7">
            <Field label="Dental Service" id="serviceId">
              <select id="serviceId" name="serviceId" value={formData.serviceId} onChange={(e) => update('serviceId', e.target.value)} className={inputClass(false)} disabled={catalogLoading || services.length === 0}>
                {services.length === 0 ? (
                  <option value="">No active services available</option>
                ) : (
                  services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.duration}</option>)
                )}
              </select>
            </Field>

            {doctors.length > 0 && (
              <Field label="Preferred Dentist (Optional)" id="doctorId">
                <select id="doctorId" name="doctorId" value={formData.doctorId} onChange={(e) => update('doctorId', e.target.value)} className={inputClass(false)} disabled={catalogLoading}>
                  <option value="">Any available dentist</option>
                  {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} — {doctor.specialization}</option>)}
                </select>
              </Field>
            )}
          </div>

          <Field label="Message (Optional)" id="message" icon={<FileText size={18} aria-hidden="true" />} className="mt-7">
            <textarea
              id="message" name="message" rows={4} value={formData.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Tell the clinic anything useful about your request." maxLength={1000}
              className={inputClass(false) + ' resize-y'}
            />
          </Field>

          <label className="mt-6 flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={(e) => update('consent', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              required
            />
            <span>I agree that the clinic may use the information I provide to contact me regarding this appointment request.</span>
          </label>
          {errors.consent && <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.consent}</p>}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mt-7 w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <Send size={18} aria-hidden="true" />
                <span>Submit Appointment Request</span>
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            Submitting this form sends an appointment request. The clinic will contact you to confirm availability and timing.
          </p>
        </form>
      )}

      <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {clinicConfig.phone && <a
          href={`tel:${clinicConfig.phone}`}
          className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-navy-800 font-semibold p-3.5 rounded-xl border border-slate-200 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          aria-label={`Call ${clinicConfig.name} at ${clinicConfig.phone}`}
        >
          <Phone size={16} className="text-brand-600" aria-hidden="true" />
          <span>Call {clinicConfig.phone}</span>
        </a>}
        {clinicConfig.whatsapp && <a
          href={buildAppointmentWhatsApp(request, clinicConfig.whatsapp, clinicConfig.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold p-3.5 rounded-xl border border-emerald-200 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          aria-label={`Message ${clinicConfig.name} on WhatsApp`}
        >
          <MessageSquare size={16} className="text-emerald-600" aria-hidden="true" />
          <span>Request via WhatsApp</span>
        </a>}
      </div>
    </div>
  );
};

function inputClass(hasError: boolean) {
  return `w-full px-4 py-3 rounded-xl border text-sm text-navy-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
    hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
  }`;
}

interface FieldProps {
  label: string;
  id: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, id, icon, error, required, className = '', children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-2">
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>}
        <div className={icon ? '[&>input]:pl-10 [&>textarea]:pl-10 [&>select]:pl-10' : ''}>{children}</div>
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600 flex items-start gap-1" role="alert"><AlertCircle size={13} aria-hidden="true" /><span>{error}</span></p>}
    </div>
  );
}
