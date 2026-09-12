import { createClient } from 'npm:@supabase/supabase-js@2';

const projectUrl = Deno.env.get('SUPABASE_URL') || '';
const publishableKeys = (() => {
  try { return JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}'); } catch { return {}; }
})();
const clientApiKey = publishableKeys.default || Deno.env.get('SUPABASE_ANON_KEY') || '';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || Deno.env.get('ALLOWED_ORIGIN') || 'https://poetic-churros-8ac9f5.netlify.app,http://localhost:5173')
  .split(',').map((value) => value.trim()).filter(Boolean);

const isAllowedOrigin = (origin: string) => {
  if (!origin) return true;
  return allowedOrigins.includes('*') || allowedOrigins.includes(origin);
};

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin || allowedOrigins[0] || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
  'Content-Type': 'application/json',
});

const json = (body: Record<string, unknown>, status: number, origin: string) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  if (!isAllowedOrigin(origin)) return json({ error: 'FORBIDDEN' }, 403, origin);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405, origin);

  // Public patients do not have Supabase Auth sessions. The publishable/anon API
  // key identifies the application, while the origin allow-list and server-side
  // validation/rate limiting provide additional abuse controls.
  const suppliedApiKey = req.headers.get('apikey') || '';
  if (!clientApiKey || suppliedApiKey !== clientApiKey) return json({ error: 'UNAUTHORIZED' }, 401, origin);

  if (!projectUrl || !serviceKey) return json({ error: 'CONFIGURATION_ERROR' }, 500, origin);
  const admin = createClient(projectUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  const clientIp = forwarded.split(',')[0].trim().slice(0, 80) || 'unknown';

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'INVALID_REQUEST' }, 400, origin); }

  const clinicId = typeof body.clinic_id === 'string' ? body.clinic_id : '';
  const patientName = typeof body.patient_name === 'string' ? body.patient_name.trim() : '';
  const patientPhone = typeof body.patient_phone === 'string' ? body.patient_phone.trim() : '';
  const patientEmail = typeof body.patient_email === 'string' ? body.patient_email.trim() : null;
  const doctorId = typeof body.doctor_id === 'string' && body.doctor_id ? body.doctor_id : null;
  const serviceId = typeof body.service_id === 'string' && body.service_id ? body.service_id : null;
  const appointmentDate = typeof body.appointment_date === 'string' ? body.appointment_date : '';
  const appointmentTime = typeof body.appointment_time === 'string' ? body.appointment_time : '';
  const message = typeof body.message === 'string' ? body.message.trim() : null;
  const contactConsent = body.contact_consent === true;

  if (!clinicId || patientName.length < 2 || patientName.length > 120 || !/^[+()0-9\s./-]{7,30}$/.test(patientPhone) ||
      (patientEmail !== null && patientEmail !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(appointmentTime) ||
      (message !== null && message.length > 1000) || !contactConsent) {
    return json({ error: 'INVALID_REQUEST' }, 400, origin);
  }

  const { data: allowed, error: rateError } = await admin.rpc('check_rate_limit', {
    p_ip: clientIp,
    p_endpoint: `create_appointment:${clinicId}`,
    p_max_requests: 10,
    p_window_seconds: 60,
  });
  if (rateError) return json({ error: 'RATE_LIMIT_SERVICE_UNAVAILABLE' }, 503, origin);
  if (!allowed) return json({ error: 'RATE_LIMITED' }, 429, origin);

  const { data, error } = await admin.rpc('create_appointment_secure', {
    p_clinic_id: clinicId,
    p_patient_name: patientName,
    p_patient_phone: patientPhone,
    p_patient_email: patientEmail || null,
    p_doctor_id: doctorId,
    p_service_id: serviceId,
    p_appointment_date: appointmentDate,
    p_appointment_time: appointmentTime,
    p_message: message || null,
    p_contact_consent: contactConsent,
  });

  if (error) {
    const safeCodes = ['SLOT_UNAVAILABLE', 'INVALID_CLINIC', 'INVALID_DOCTOR', 'INVALID_SERVICE', 'PAST_DATE_NOT_ALLOWED', 'INVALID_PATIENT_NAME', 'INVALID_PATIENT_PHONE', 'INVALID_PATIENT_EMAIL', 'INVALID_MESSAGE', 'CONTACT_CONSENT_REQUIRED'];
    const code = safeCodes.find((value) => error.message?.includes(value));
    if (code === 'SLOT_UNAVAILABLE') return json({ error: code }, 409, origin);
    if (code) return json({ error: code }, 400, origin);
    console.error('create_appointment_secure failed:', error.message);
    return json({ error: 'APPOINTMENT_FAILED' }, 500, origin);
  }

  return json({ success: true, appointment_id: data?.appointment_id, doctor_id: data?.doctor_id }, 200, origin);
});
