import fs from 'node:fs';
import path from 'node:path';

const required = [
  'src/config/clinic.ts','src/types/clinic.ts','src/components/ui/SEO.tsx','src/components/ui/ErrorBoundary.tsx',
  'src/components/sections/AppointmentForm.tsx','src/pages/PrivacyPage.tsx','src/pages/TermsPage.tsx',
  'public/_headers','public/_redirects','public/robots.txt','public/site.webmanifest','src/index.css','src/utils/adminSecurity.ts','supabase/schema.sql',
  'src/lib/supabase.ts','src/services/authService.ts','src/services/appointmentBackendService.ts',
  'src/services/doctorService.ts','src/services/serviceService.ts','src/services/notificationService.ts',
  'scripts/run-tests.mjs','supabase/functions/create-appointment/index.ts','supabase/functions/get-availability/index.ts','supabase/config.toml','supabase/seed.sql','.env.example'
];
const forbidden = ['abhijeetmukhiya360@gmail.com','your-domain.example'];
const failures = [];
for (const file of required) if (!fs.existsSync(file)) failures.push(`Missing ${file}`);
const source = required.filter(f => fs.existsSync(f)).map(f => fs.readFileSync(f,'utf8')).join('\n');
for (const value of forbidden) if (source.includes(value)) failures.push(`Unresolved placeholder/contact value: ${value}`);
if (!source.includes('prefers-reduced-motion')) failures.push('Reduced-motion support missing');
const headers = fs.readFileSync('public/_headers','utf8');
for (const header of ['X-Content-Type-Options: nosniff','Content-Security-Policy:','Strict-Transport-Security:']) if (!headers.includes(header)) failures.push(`Security header missing: ${header}`);
const adminSecurity = fs.readFileSync('src/utils/adminSecurity.ts','utf8');
if (adminSecurity.includes("localStorage.getItem('samaj_admin_demo_auth')")) failures.push('Admin auth must not persist in localStorage');
if (!adminSecurity.includes('SESSION_TTL_MS')) failures.push('Admin session timeout missing');

const vercelConfig = fs.readFileSync('vercel.json', 'utf8');
for (const header of ['X-Content-Type-Options', 'Content-Security-Policy', 'Strict-Transport-Security', 'X-Robots-Tag']) {
  if (!vercelConfig.includes(header)) failures.push(`Vercel security header missing: ${header}`);
}
if (!fs.readFileSync('public/robots.txt', 'utf8').includes('Disallow: /admin')) failures.push('robots.txt must disallow /admin');
if (adminSecurity.includes("import.meta.env.DEV ||")) failures.push('Demo authentication must not be enabled by a production environment variable.');
if (adminSecurity.includes("'admin123'")) failures.push('Obvious demo password must not remain in admin security code.');

const schema = fs.readFileSync('supabase/schema.sql','utf8');
if (!schema.includes('set search_path = pg_catalog, public')) failures.push('SECURITY DEFINER functions should pin a safe search_path');
if (!schema.includes('enable row level security')) failures.push('Supabase RLS missing');
if (!schema.includes('appointments_no_interval_overlap')) failures.push('Appointment interval overlap constraint missing');
if (schema.indexOf('create table if not exists doctors') > schema.indexOf('create table if not exists clinic_users')) failures.push('Fresh schema must create doctors before clinic_users foreign key');
if (!schema.includes("current_setting('app.allow_schedule_change', true)")) failures.push('Direct scheduling-field update guard missing');
if (!schema.includes("INVALID_STATUS_TRANSITION")) failures.push('Appointment status lifecycle guard missing');
if (!schema.includes('Any dentist')) failures.push('Any-dentist availability documentation/logic missing');
if (!schema.includes('CONTACT_CONSENT_REQUIRED') || !schema.includes('contact_consent_at')) failures.push('Contact consent requirement missing from appointment backend');
if (!schema.includes('appointment_duration_minutes')) failures.push('Appointment duration column missing');
if (!schema.includes('clinic_users add column if not exists doctor_id')) failures.push('Doctor identity mapping migration missing');
if (!schema.includes('rate_limits')) failures.push('Rate limits table missing from schema');
if (!schema.includes('check_rate_limit')) failures.push('check_rate_limit RPC missing from schema');
if (!schema.includes('current_user_doctor_id')) failures.push('current_user_doctor_id function missing from schema');
if (!schema.includes('admins can insert staff') || !schema.includes('admins can update staff') || !schema.includes('admins can delete staff')) failures.push('Admin-only staff management RLS policies missing from schema');
if (!schema.includes("revoke all on function public.create_appointment_secure(uuid, text, text, text, uuid, uuid, date, time, text, boolean) from public, anon, authenticated")) failures.push('Public appointment RPC must not be directly executable');
if (!schema.includes("current_user_role() = 'doctor' and doctor_id = public.current_user_doctor_id()")) failures.push('Doctor appointment RLS isolation missing');
if (!schema.includes('display_title text') || !schema.includes('qualification text')) failures.push('Doctor profile metadata columns missing');
if (!schema.includes('category text') || !schema.includes('icon_name text')) failures.push('Service metadata columns missing');
const frontendSource = fs.readdirSync('src', { recursive: true }).filter(f => typeof f === 'string' && /\.(ts|tsx|js|jsx)$/.test(f)).map(f => fs.readFileSync(path.join('src', f), 'utf8')).join('\n');
if (frontendSource.includes('SUPABASE_SERVICE_ROLE_KEY')) failures.push('Service role key must never appear in frontend source');
for (const file of ['src/services/doctorService.ts','src/services/serviceService.ts']) {
  const body = fs.readFileSync(file, 'utf8');
  if (body.includes('localStorage')) failures.push(`${file} must not use browser storage for production catalog data`);
}
if (frontendSource.includes('doctor_name === user')) failures.push('Doctor authorization must not use display-name matching');
if (!fs.existsSync('supabase/functions/create-appointment/index.ts')) failures.push('Secure appointment Edge Function missing');
if (!fs.existsSync('supabase/functions/get-availability/index.ts')) failures.push('Availability Edge Function missing');
const functionConfig = fs.readFileSync('supabase/config.toml','utf8');
if (!functionConfig.includes('[functions.create-appointment]') || !functionConfig.includes('verify_jwt = false')) failures.push('Public appointment Edge Function auth mode not explicitly configured');
for (const file of ['supabase/functions/create-appointment/index.ts','supabase/functions/get-availability/index.ts']) {
  const fn = fs.readFileSync(file,'utf8');
  if (!fn.includes("req.headers.get('apikey')")) failures.push(`${file} missing application API-key check`);
  if (!fn.includes('ALLOWED_ORIGINS')) failures.push(`${file} missing configurable origin allow-list`);
}


const sourceJs = fs.readdirSync('src', { recursive: true }).filter((file) => typeof file === 'string' && file.endsWith('.js'));
if (sourceJs.length) failures.push(`Duplicate JavaScript source files remain: ${sourceJs.join(', ')}`);
if (fs.readdirSync('.', { withFileTypes: true }).some((entry) => entry.name.includes('UNFINISHED'))) failures.push('Unprofessional UNFINISHED naming remains in release root.');
if (failures.length) { console.error(failures.map(x => `FAIL: ${x}`).join('\n')); process.exit(1); }
console.log('PASS: production template audit');
console.log(`Checked ${required.length} critical files and security/content guardrails.`);

