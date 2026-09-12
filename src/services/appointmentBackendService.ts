import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { clinicConfig } from '../config/clinic';

export interface AppointmentRecord {
  id: string;
  clinic_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  doctor_id?: string;
  doctor_name?: string;
  service_id?: string;
  service_name?: string;
  appointment_date: string;
  appointment_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  created_at: string;
  updated_at?: string;
}

export interface CreateAppointmentInput {
  clinicId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  doctorId?: string;
  serviceId?: string;
  appointmentDate: string;
  appointmentTime: string;
  message?: string;
  contactConsent: boolean;
}

export interface TimeSlotOption {
  time: string;
  available: boolean;
}

export interface AuditLogRecord {
  id: string;
  appointment_id?: string;
  actor_role: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface AppointmentJoinRow {
  id: string;
  clinic_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  doctor_id: string | null;
  service_id: string | null;
  appointment_date: string;
  appointment_time: string;
  message: string | null;
  status: AppointmentRecord['status'];
  created_at: string;
  updated_at: string;
  doctors: { name: string } | null;
  services: { name: string } | null;
}

const STORAGE_KEY = 'samaj_admin_appointments';
const AUDIT_STORAGE_KEY = 'samaj_admin_audit_logs';
const DEFAULT_CLINIC_ID = import.meta.env.VITE_CLINIC_ID || '';

const readLocal = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key: string, val: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors in demo mode
  }
};

/**
 * Dynamically fetch available time slots for a given doctor & date.
 */
export async function fetchAvailableTimeSlots(
  doctorId?: string,
  dateStr?: string,
  clinicId: string = DEFAULT_CLINIC_ID,
  serviceId?: string
): Promise<TimeSlotOption[]> {
  if (!dateStr) return [];
  const appointmentFunctionUrl = import.meta.env.VITE_AVAILABILITY_FUNCTION_URL || (supabase ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-availability` : '');

  if (isSupabaseConfigured && supabase) {
    try {
      if (appointmentFunctionUrl) {
        const response = await fetch(appointmentFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(import.meta.env.VITE_SUPABASE_ANON_KEY ? {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            } : {}),
          },
          body: JSON.stringify({ clinic_id: clinicId, doctor_id: doctorId || null, date: dateStr, service_id: serviceId || null }),
        });
        if (response.ok) {
          const payload = await response.json();
          const data = Array.isArray(payload?.slots) ? payload.slots : [];
          return data.map((item: { slot_time: string; available: boolean }) => ({ time: formatTimeString(item.slot_time), available: Boolean(item.available) }));
        } else {
          console.warn(`Supabase availability endpoint returned HTTP ${response.status}; trying the public availability RPC.`);
        }
      }

      // The public RPC is an intentional, narrow read path and is also granted to
      // anon in schema.sql. Use it as a resilience fallback if the Edge Function
      // is temporarily unavailable or its CORS allow-list has not caught up with
      // a new demo deployment. The database remains authoritative; no local slots
      // are fabricated here.
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_clinic_id: clinicId,
        p_doctor_id: doctorId || null,
        p_date: dateStr,
        p_service_id: serviceId || null,
      });
      if (!error && Array.isArray(data)) {
        return data.map((item: { slot_time: string; available: boolean }) => ({ time: formatTimeString(item.slot_time), available: Boolean(item.available) }));
      }
      if (error) console.warn('Supabase availability RPC failed:', error.message);
    } catch (e) {
      console.warn('Supabase availability request failed:', e);
    }
  }

  // In configured production mode, do not invent hours locally. The database is authoritative.
  if (isSupabaseConfigured) return [];

  // Local demo availability is deliberately disabled when no database is configured.
  return [];

}

/**
 * Securely submit an appointment request.
 */
export async function submitAppointmentRequest(
  input: CreateAppointmentInput
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  const clinicId = input.clinicId || DEFAULT_CLINIC_ID;
  if (!clinicId) return { success: false, error: 'Clinic configuration is incomplete. Please contact the clinic.' };
  if (input.contactConsent !== true) return { success: false, error: 'Please agree to be contacted about this appointment request.' };

  if (isSupabaseConfigured && supabase) {
    const endpoint = import.meta.env.VITE_APPOINTMENT_FUNCTION_URL || (supabase ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-appointment` : '');
    if (!endpoint) {
      return { success: false, error: 'Appointment service is not configured. Please contact the clinic.' };
    }
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(import.meta.env.VITE_SUPABASE_ANON_KEY ? {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          } : {}),
        },
        body: JSON.stringify({
          clinic_id: clinicId,
          patient_name: input.patientName.trim(),
          patient_phone: input.patientPhone.trim(),
          patient_email: input.patientEmail?.trim() || null,
          doctor_id: input.doctorId || null,
          service_id: input.serviceId || null,
          appointment_date: input.appointmentDate,
          appointment_time: parseTimeTo24h(input.appointmentTime),
          message: input.message?.trim() || null,
          contact_consent: input.contactConsent === true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const code = typeof data?.error === 'string' ? data.error : '';
        if (response.status === 409 || code === 'SLOT_UNAVAILABLE') {
          return { success: false, error: 'That time was just booked. Please choose another available time.' };
        }
        if (response.status === 429) return { success: false, error: 'Too many requests. Please wait a moment and try again.' };
        return { success: false, error: 'Unable to submit the appointment request. Please try again.' };
      }
      return { success: true, appointmentId: data?.appointment_id };
    } catch {
      return { success: false, error: 'Unable to reach the appointment service. Please try again.' };
    }
  }

  // Fallback demo submission with duration-aware interval overlap check
  const localAppointments = readLocal<AppointmentRecord[]>(STORAGE_KEY, []);
  const inputMinutes = parseTimeToMinutes(input.appointmentTime);
  const inputDuration = 30;

  const existingConflict = localAppointments.find((a) => {
    if (
      a.appointment_date === input.appointmentDate &&
      a.doctor_id === input.doctorId &&
      ['pending', 'confirmed'].includes(a.status)
    ) {
      const apptMinutes = parseTimeToMinutes(a.appointment_time);
      const apptDuration = 30;
      return inputMinutes < apptMinutes + apptDuration && inputMinutes + inputDuration > apptMinutes;
    }
    return false;
  });

  if (existingConflict) {
    return { success: false, error: 'That time was just booked. Please choose another available time.' };
  }

  const newAppt: AppointmentRecord = {
    id: `APT-${Date.now().toString().slice(-6)}`,
    clinic_id: clinicId,
    patient_name: input.patientName,
    patient_phone: input.patientPhone,
    patient_email: input.patientEmail,
    doctor_id: input.doctorId,
    doctor_name: clinicConfig.doctors.find((d) => d.id === input.doctorId)?.name || 'Any available dentist',
    service_id: input.serviceId,
    service_name: clinicConfig.services.find((s) => s.id === input.serviceId)?.title || 'General Dentistry',
    appointment_date: input.appointmentDate,
    appointment_time: input.appointmentTime,
    message: input.message,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  const updated = [newAppt, ...localAppointments];
  writeLocal(STORAGE_KEY, updated);

  // Add audit log
  const auditLogs = readLocal<AuditLogRecord[]>(AUDIT_STORAGE_KEY, []);
  const newAudit: AuditLogRecord = {
    id: `AUD-${Date.now()}`,
    appointment_id: newAppt.id,
    actor_role: 'patient_public',
    action: 'APPOINTMENT_CREATED',
    details: { patient_name: input.patientName, date: input.appointmentDate, time: input.appointmentTime },
    created_at: new Date().toISOString(),
  };
  writeLocal(AUDIT_STORAGE_KEY, [newAudit, ...auditLogs]);

  return { success: true, appointmentId: newAppt.id };
}

/**
 * Fetch list of appointments for clinic staff dashboard.
 */
export async function fetchAppointmentsList(
  clinicId: string = DEFAULT_CLINIC_ID
): Promise<AppointmentRecord[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, clinic_id, patient_name, patient_phone, patient_email,
          doctor_id, service_id, appointment_date, appointment_time, message,
          status, created_at, updated_at,
          doctors(name), services(name)
        `)
        .eq('clinic_id', clinicId)
        .order('appointment_date', { ascending: false });

      if (!error && data) {
        return (data as unknown as AppointmentJoinRow[]).map((item) => ({
          id: item.id,
          clinic_id: item.clinic_id,
          patient_name: item.patient_name,
          patient_phone: item.patient_phone,
          patient_email: item.patient_email || '',
          doctor_id: item.doctor_id || '',
          doctor_name: item.doctors?.name || 'Any available dentist',
          service_id: item.service_id || '',
          service_name: item.services?.name || 'General Dentistry',
          appointment_date: item.appointment_date,
          appointment_time: formatTimeString(item.appointment_time),
          message: item.message || '',
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
      }
    } catch (e) {
      console.error('Supabase appointment fetch failed:', e);
    }
    return [];
  }

  // Development-only sandbox data.
  const local = readLocal<AppointmentRecord[]>(STORAGE_KEY, []);
  if (local.length === 0) {
    const seed: AppointmentRecord[] = [
      {
        id: 'APT-1001',
        clinic_id: clinicId,
        patient_name: 'Anisha Karki',
        patient_phone: '+977 9800000001',
        patient_email: 'anisha@example.com',
        appointment_date: new Date().toISOString().slice(0, 10),
        appointment_time: '10:00 AM',
        service_name: 'General Dentistry',
        doctor_name: 'Any available dentist',
        status: 'confirmed',
        created_at: new Date().toISOString(),
      },
      {
        id: 'APT-1002',
        clinic_id: clinicId,
        patient_name: 'Rohan Shrestha',
        patient_phone: '+977 9800000002',
        patient_email: 'rohan@example.com',
        appointment_date: new Date().toISOString().slice(0, 10),
        appointment_time: '11:30 AM',
        service_name: 'Orthodontics',
        doctor_name: 'Any available dentist',
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ];
    writeLocal(STORAGE_KEY, seed);
    return seed;
  }
  return local;
}

/**
 * Update status of an existing appointment.
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: AppointmentRecord['status'],
  actorRole: string = 'staff'
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);

      if (!error) {
        // Audit logging is generated by the database trigger so the actor role
        // comes from the authenticated database session, not browser input.
        return true;
      }
    } catch (e) {
      console.error('Failed to update status in Supabase:', e);
    }
    return false;
  }

  // Development-only sandbox fallback.
  const local = readLocal<AppointmentRecord[]>(STORAGE_KEY, []);
  const next = local.map((a) => (a.id === appointmentId ? { ...a, status: newStatus, updated_at: new Date().toISOString() } : a));
  writeLocal(STORAGE_KEY, next);

  const auditLogs = readLocal<AuditLogRecord[]>(AUDIT_STORAGE_KEY, []);
  const newAudit: AuditLogRecord = {
    id: `AUD-${Date.now()}`,
    appointment_id: appointmentId,
    actor_role: actorRole,
    action: `STATUS_CHANGED_TO_${newStatus.toUpperCase()}`,
    details: { new_status: newStatus },
    created_at: new Date().toISOString(),
  };
  writeLocal(AUDIT_STORAGE_KEY, [newAudit, ...auditLogs]);

  return true;
}

/**
 * Reschedule an appointment securely with interval overlap checking.
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newDate: string,
  newTime: string,
  actorRole: string = 'staff'
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.rpc('reschedule_appointment_secure', {
        p_appointment_id: appointmentId,
        p_new_date: newDate,
        p_new_time: parseTimeTo24h(newTime),
      });
      if (!error) return { success: true };
      if (error.message.includes('SLOT_UNAVAILABLE')) return { success: false, error: 'That time is unavailable. Please choose another slot.' };
      if (error.message.includes('UNAUTHORIZED')) return { success: false, error: 'You are not allowed to reschedule this appointment.' };
      if (error.message.includes('PAST_DATE_NOT_ALLOWED')) return { success: false, error: 'Please choose today or a future date.' };
      if (error.message.includes('APPOINTMENT_NOT_RESCHEDULABLE')) return { success: false, error: 'Only pending or confirmed appointments can be rescheduled.' };
      return { success: false, error: 'Unable to reschedule the appointment.' };
    } catch {
      return { success: false, error: 'Unable to reschedule the appointment.' };
    }
  }

  // Local development fallback.
  const local = readLocal<AppointmentRecord[]>(STORAGE_KEY, []);
  const target = local.find((a) => a.id === appointmentId);
  if (!target) return { success: false, error: 'Appointment not found.' };
  const next = local.map((a) =>
    a.id === appointmentId ? { ...a, appointment_date: newDate, appointment_time: newTime, updated_at: new Date().toISOString() } : a
  );
  writeLocal(STORAGE_KEY, next);

  const auditLogs = readLocal<AuditLogRecord[]>(AUDIT_STORAGE_KEY, []);
  const newAudit: AuditLogRecord = {
    id: `AUD-${Date.now()}`,
    appointment_id: appointmentId,
    actor_role: actorRole,
    action: 'APPOINTMENT_RESCHEDULED',
    details: { new_date: newDate, new_time: newTime },
    created_at: new Date().toISOString(),
  };
  writeLocal(AUDIT_STORAGE_KEY, [newAudit, ...auditLogs]);
  return { success: true };
}

/**
 * Fetch audit logs for clinic administration.
 */
export async function fetchAuditLogs(clinicId: string = DEFAULT_CLINIC_ID): Promise<AuditLogRecord[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('appointment_audit_logs')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) return data;
    } catch (e) {
      console.error('Audit fetch failed:', e);
    }
    return [];
  }

  return readLocal<AuditLogRecord[]>(AUDIT_STORAGE_KEY, []);
}

// Helpers
function formatTimeString(raw: string): string {
  if (!raw) return '10:00 AM';
  if (raw.includes('AM') || raw.includes('PM')) return raw;
  const parts = raw.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

function parseTimeTo24h(timeStr: string): string {
  if (!timeStr) return '09:00:00';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 540; // 09:00 AM
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    const parts = timeStr.split(':');
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}
