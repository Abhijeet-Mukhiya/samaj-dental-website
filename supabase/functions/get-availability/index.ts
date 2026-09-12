import { createClient } from 'npm:@supabase/supabase-js@2';

const projectUrl = Deno.env.get('SUPABASE_URL') || '';
const publishableKeys = (() => {
  try { return JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}'); } catch { return {}; }
})();
const clientApiKey = publishableKeys.default || Deno.env.get('SUPABASE_ANON_KEY') || '';
const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || Deno.env.get('ALLOWED_ORIGIN') || 'https://poetic-churros-8ac9f5.netlify.app,http://localhost:5173')
  .split(',').map((value) => value.trim()).filter(Boolean);
const isAllowedOrigin = (origin: string) => !origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin);
const headersFor = (origin: string) => ({
  'Access-Control-Allow-Origin': origin || allowedOrigins[0] || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
  'Content-Type': 'application/json',
});
const json = (body: Record<string, unknown>, status: number, origin: string) => new Response(JSON.stringify(body), { status, headers: headersFor(origin) });

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  if (!isAllowedOrigin(origin)) return json({ error: 'FORBIDDEN' }, 403, origin);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: headersFor(origin) });
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405, origin);
  if (!clientApiKey || (req.headers.get('apikey') || '') !== clientApiKey) return json({ error: 'UNAUTHORIZED' }, 401, origin);
  if (!projectUrl) return json({ error: 'CONFIGURATION_ERROR' }, 500, origin);

  const supabase = createClient(projectUrl, clientApiKey, { auth: { persistSession: false, autoRefreshToken: false } });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'INVALID_REQUEST' }, 400, origin); }
  const clinicId = typeof body.clinic_id === 'string' ? body.clinic_id : '';
  const doctorId = typeof body.doctor_id === 'string' && body.doctor_id ? body.doctor_id : null;
  const date = typeof body.date === 'string' ? body.date : '';
  const serviceId = typeof body.service_id === 'string' && body.service_id ? body.service_id : null;
  if (!clinicId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'INVALID_REQUEST' }, 400, origin);

  const { data, error } = await supabase.rpc('get_available_slots', { p_clinic_id: clinicId, p_doctor_id: doctorId, p_date: date, p_service_id: serviceId });
  if (error) return json({ error: 'AVAILABILITY_UNAVAILABLE' }, 503, origin);
  return json({ slots: data || [] }, 200, origin);
});
