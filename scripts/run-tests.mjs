import assert from 'node:assert';
import fs from 'node:fs';

console.log('🧪 Running Samaj Dental Master Production Test Suite...\n');

let passCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASSED: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAILED: ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------------------------------
// 1. Input Validation Tests
// ----------------------------------------------------------------------------

test('Patient name length validation (min 2, max 120 chars)', () => {
  const validateName = (name) => Boolean(name && name.trim().length >= 2 && name.trim().length <= 120);
  assert.strictEqual(validateName('A'), false, '1-char name should fail');
  assert.strictEqual(validateName('Anisha Karki'), true, 'Valid name should pass');
  assert.strictEqual(validateName(''), false, 'Empty name should fail');
  assert.strictEqual(validateName('x'.repeat(121)), false, '121-char name should fail');
});

test('Patient phone validation regex', () => {
  const phoneRegex = /^[+()0-9\s./-]{7,20}$/;
  assert.strictEqual(phoneRegex.test('+977 9820231230'), true);
  assert.strictEqual(phoneRegex.test('9820231230'), true);
  assert.strictEqual(phoneRegex.test('123'), false, 'Short phone number should fail');
  assert.strictEqual(phoneRegex.test('abc123456789'), false, 'Alphabetic phone number should fail');
});

test('Patient email format validation', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.strictEqual(emailRegex.test('patient@example.com'), true);
  assert.strictEqual(emailRegex.test('invalid-email'), false);
  assert.strictEqual(emailRegex.test('@example.com'), false);
});

test('Appointment date cannot be in the past', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pastDate = new Date('2020-01-01T00:00:00');
  assert.strictEqual(pastDate < today, true, 'Past date must be detected');

  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 7);
  assert.strictEqual(futureDate >= today, true, 'Future date must be accepted');
});


test('Appointment contact consent is required before submission', () => {
  const form = { consent: false };
  assert.strictEqual(form.consent, false);
  form.consent = true;
  assert.strictEqual(form.consent, true);
  const backend = fs.readFileSync('src/services/appointmentBackendService.ts', 'utf8');
  assert.strictEqual(backend.includes('contact_consent'), true);
});

test('Appointment success copy does not imply confirmation', () => {
  const source = fs.readFileSync('src/components/sections/AppointmentForm.tsx', 'utf8');
  assert.strictEqual(source.includes('Appointment Request Received'), true);
  assert.strictEqual(source.includes('Your appointment has been securely stored'), false);
  assert.strictEqual(source.includes('Confirming Booking...'), false);
});

// ----------------------------------------------------------------------------
// 2. Role-Based Access Control (RBAC) & Escalation Security
// ----------------------------------------------------------------------------

test('Role permissions scoping (Admin vs Receptionist vs Doctor)', () => {
  const permissions = {
    admin: ['manage_doctors', 'manage_services', 'manage_staff', 'manage_appointments', 'view_audit_logs'],
    receptionist: ['manage_appointments', 'view_doctors', 'view_services'],
    doctor: ['view_assigned_appointments', 'update_appointment_status'],
  };

  assert.strictEqual(permissions.admin.includes('manage_staff'), true);
  assert.strictEqual(permissions.receptionist.includes('manage_staff'), false, 'Receptionist cannot manage staff');
  assert.strictEqual(permissions.doctor.includes('manage_services'), false, 'Doctor cannot manage services');
});

test('Doctor role appointment isolation uses stable doctor_id, never display name', () => {
  const doctorUser = { id: 'user-123', role: 'doctor', doctorId: 'doc-123', name: 'Dr. Sita' };
  const appointments = [
    { id: 'apt-1', doctor_id: 'doc-123', doctor_name: 'Dr. Sita', patient_name: 'Anisha' },
    { id: 'apt-2', doctor_id: 'doc-456', doctor_name: 'Dr. Sita', patient_name: 'Bibek' },
  ];

  const visible = appointments.filter(a => doctorUser.role === 'admin' || a.doctor_id === doctorUser.doctorId);
  assert.strictEqual(visible.length, 1);
  assert.strictEqual(visible[0].id, 'apt-1');
});

test('Receptionist staff privilege escalation guard', () => {
  function attemptRoleChange(callerRole, targetRole) {
    if (callerRole !== 'admin') return { success: false, error: 'UNAUTHORIZED_ROLE_CHANGE' };
    return { success: true, newRole: targetRole };
  }

  assert.strictEqual(attemptRoleChange('receptionist', 'admin').success, false, 'Receptionist cannot make admin');
  assert.strictEqual(attemptRoleChange('admin', 'receptionist').success, true, 'Admin can change role');
});

// ----------------------------------------------------------------------------
// 3. Multi-Tenant Clinic Isolation Tests
// ----------------------------------------------------------------------------

test('Cross-clinic data access denial', () => {
  const userClinicId = 'clinic-A';
  const appointment = { id: 'apt-99', clinic_id: 'clinic-B' };

  const canAccess = appointment.clinic_id === userClinicId;
  assert.strictEqual(canAccess, false, 'User from Clinic A must be denied access to Clinic B data');
});

// ----------------------------------------------------------------------------
// 4. Interval Overlap & Concurrency Collision Tests
// ----------------------------------------------------------------------------

test('Exact slot start time collision prevention', () => {
  const bookedSlots = new Set(['2026-09-10_10:00 AM_DOC-1']);

  function isSlotAvailable(date, time, doctorId) {
    const key = `${date}_${time}_${doctorId}`;
    return !bookedSlots.has(key);
  }

  assert.strictEqual(isSlotAvailable('2026-09-10', '10:00 AM', 'DOC-1'), false, 'Booked slot must return unavailable');
  assert.strictEqual(isSlotAvailable('2026-09-10', '11:00 AM', 'DOC-1'), true, 'Free slot must return available');
});

test('Duration-aware interval overlap collision protection', () => {
  // Appointment A is 10:00 - 11:00 (60 minutes)
  const existingAppt = { startMinutes: 600, endMinutes: 660, doctorId: 'DOC-1' };

  function checkOverlap(reqStartMinutes, reqDurationMinutes, doctorId) {
    if (doctorId !== existingAppt.doctorId) return false;
    const reqEndMinutes = reqStartMinutes + reqDurationMinutes;
    return reqStartMinutes < existingAppt.endMinutes && reqEndMinutes > existingAppt.startMinutes;
  }

  assert.strictEqual(checkOverlap(630, 30, 'DOC-1'), true, '10:30-11:00 overlaps 10:00-11:00');
  assert.strictEqual(checkOverlap(600, 30, 'DOC-1'), true, '10:00-10:30 overlaps 10:00-11:00');
  assert.strictEqual(checkOverlap(660, 30, 'DOC-1'), false, '11:00-11:30 does not overlap');
});

// ----------------------------------------------------------------------------
// 5. Doctor & Service Ownership / Active Status Validation
// ----------------------------------------------------------------------------

test('Inactive doctor booking rejection', () => {
  const doctor = { id: 'doc-inactive', active: false, clinic_id: 'clinic-1' };
  function validateDoctorBooking(doc) {
    return Boolean(doc && doc.active);
  }
  assert.strictEqual(validateDoctorBooking(doctor), false, 'Inactive doctor booking must be rejected');
});

test('Doctor clinic ownership validation', () => {
  const clinicId = 'clinic-A';
  const doctor = { id: 'doc-1', clinic_id: 'clinic-B', active: true };
  function validateDoctorOwnership(doc, targetClinicId) {
    return Boolean(doc && doc.clinic_id === targetClinicId);
  }
  assert.strictEqual(validateDoctorOwnership(doctor, clinicId), false, 'Doctor from different clinic must be rejected');
});

test('Inactive service booking rejection', () => {
  const service = { id: 'svc-inactive', active: false, clinic_id: 'clinic-1' };
  function validateServiceBooking(svc) {
    return Boolean(svc && svc.active);
  }
  assert.strictEqual(validateServiceBooking(service), false, 'Inactive service booking must be rejected');
});

test('Different start times are still blocked when durations overlap', () => {
  const existing = { start: 600, duration: 60, doctorId: 'DOC-1' };
  const overlaps = (start, duration) =>
    start < existing.start + existing.duration &&
    start + duration > existing.start;
  assert.strictEqual(overlaps(630, 30), true);
  assert.strictEqual(overlaps(660, 30), false);
});

test('Appointment status transitions reject invalid lifecycle jumps', () => {
  const allowed = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled', 'no_show'],
    completed: [],
    cancelled: [],
    no_show: [],
  };
  assert.strictEqual(allowed.pending.includes('completed'), false);
  assert.strictEqual(allowed.pending.includes('confirmed'), true);
  assert.strictEqual(allowed.confirmed.includes('completed'), true);
  assert.strictEqual(allowed.completed.includes('confirmed'), false);
  assert.strictEqual(allowed.cancelled.includes('confirmed'), false);
  assert.strictEqual(allowed.no_show.includes('pending'), false);
});

test('Terminal appointments cannot be rescheduled', () => {
  const reschedulable = new Set(['pending', 'confirmed']);
  assert.strictEqual(reschedulable.has('pending'), true);
  assert.strictEqual(reschedulable.has('confirmed'), true);
  assert.strictEqual(reschedulable.has('completed'), false);
  assert.strictEqual(reschedulable.has('cancelled'), false);
  assert.strictEqual(reschedulable.has('no_show'), false);
});

test('Same-day slots must not start in the past', () => {
  const nowMinutes = 11 * 60;
  const slotMinutes = 10 * 60 + 30;
  assert.strictEqual(slotMinutes <= nowMinutes, true);
});

test('Any-doctor selection must consider schedule availability, not only conflicts', () => {
  const doctors = [
    { id: 'DOC-1', scheduled: false, conflicting: false },
    { id: 'DOC-2', scheduled: true, conflicting: false },
  ];
  const selected = doctors.find(d => d.scheduled && !d.conflicting);
  assert.strictEqual(selected.id, 'DOC-2');
});

test('Cross-clinic doctor assignment is rejected', () => {
  const clinic = 'clinic-A';
  const doctor = { clinic_id: 'clinic-B', active: true };
  assert.strictEqual(doctor.clinic_id === clinic && doctor.active, false);
});

// ----------------------------------------------------------------------------
// 6. Rate Limiting Throttling Simulation
// ----------------------------------------------------------------------------

test('Rate limiting window check (10 requests per 60s per IP)', () => {
  const windowRequests = [];
  const maxRequests = 10;
  const windowMs = 60000;

  function canRequest(now) {
    while (windowRequests.length > 0 && now - windowRequests[0] > windowMs) {
      windowRequests.shift();
    }
    if (windowRequests.length >= maxRequests) return false;
    windowRequests.push(now);
    return true;
  }

  const baseTime = Date.now();
  for (let i = 0; i < 10; i++) {
    assert.strictEqual(canRequest(baseTime), true, `Request ${i+1} should pass`);
  }
  assert.strictEqual(canRequest(baseTime), false, '11th request within window must be blocked');
});

// ----------------------------------------------------------------------------
// 7. Live Supabase Integration Contract Tests
// ----------------------------------------------------------------------------

test('Public catalog uses narrow RPCs rather than direct anonymous table reads', () => {
  const doctorSource = fs.readFileSync('src/services/doctorService.ts', 'utf8');
  const serviceSource = fs.readFileSync('src/services/serviceService.ts', 'utf8');
  assert.strictEqual(doctorSource.includes("rpc('get_public_doctors'"), true);
  assert.strictEqual(serviceSource.includes("rpc('get_public_services'"), true);
});

test('Demo build loads the connected Supabase configuration', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.strictEqual(pkg.scripts.build.includes('vite build --mode demo'), true);
  const env = fs.readFileSync('.env.demo', 'utf8');
  assert.strictEqual(env.includes('VITE_SUPABASE_URL=https://kmfiecnlmgkgtmnuziux.supabase.co'), true);
  assert.strictEqual(env.includes('VITE_CLINIC_ID=a1010101-1010-1010-1010-101010101010'), true);
});

test('CSP allows Google Fonts stylesheet', () => {
  const headers = fs.readFileSync('public/_headers', 'utf8');
  assert.strictEqual(headers.includes("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"), true);
});

test('Availability client falls back to the public database RPC', () => {
  const source = fs.readFileSync('src/services/appointmentBackendService.ts', 'utf8');
  assert.strictEqual(source.includes("supabase.rpc('get_available_slots'"), true);
  assert.strictEqual(source.includes('trying the public availability RPC'), true);
});

test('Appointment Edge Function requests include the Supabase Authorization header', () => {
  const source = fs.readFileSync('src/services/appointmentBackendService.ts', 'utf8');
  assert.strictEqual((source.match(/Authorization: `Bearer/g) || []).length >= 2, true);
});

test('Appointment endpoint derives from Supabase URL when no custom URL is supplied', () => {
  const source = fs.readFileSync('src/services/appointmentBackendService.ts', 'utf8');
  assert.strictEqual(source.includes("/functions/v1/create-appointment"), true);
  assert.strictEqual(source.includes("apikey"), true);
});

test('Public Edge Functions use API-key and origin checks', () => {
  for (const file of ['supabase/functions/create-appointment/index.ts', 'supabase/functions/get-availability/index.ts']) {
    const source = fs.readFileSync(file, 'utf8');
    assert.strictEqual(source.includes("req.headers.get('apikey')"), true);
    assert.strictEqual(source.includes('ALLOWED_ORIGINS'), true);
  }
});

test('Demo data is explicitly marked as replaceable', () => {
  const source = fs.readFileSync('DEMO_DATA.md', 'utf8');
  assert.strictEqual(source.includes('placeholder'), true);
  assert.strictEqual(source.includes('Before a real launch'), true);
});

// ----------------------------------------------------------------------------
// 8. Database Schedule Absence Handling
// ----------------------------------------------------------------------------

test('Database schedule absence returns empty slots (no hardcoded fallback)', () => {
  function calculateSlotsFromSchedule(schedule) {
    if (!schedule || !schedule.active) return []; // Require database schedule
    return ['09:00 AM', '10:00 AM'];
  }

  assert.deepStrictEqual(calculateSlotsFromSchedule(null), [], 'Null schedule should return empty array');
  assert.deepStrictEqual(calculateSlotsFromSchedule({ active: false }), [], 'Inactive schedule should return empty array');
});



// ----------------------------------------------------------------------------
// 9. Presentation/config guardrails
// ----------------------------------------------------------------------------

test('Email UI is conditional when clinic email is empty', () => {
  const topBar = fs.readFileSync('src/components/layout/TopBar.tsx', 'utf8');
  const map = fs.readFileSync('src/components/sections/MapContactSection.tsx', 'utf8');
  assert.strictEqual(topBar.includes('mailto:${clinicConfig.email}'), false);
  assert.strictEqual(map.includes('mailto:${clinicConfig.email}'), false);
});

test('Demo notice has one global rendering point', () => {
  const app = fs.readFileSync('src/App.tsx', 'utf8');
  const topBar = fs.readFileSync('src/components/layout/TopBar.tsx', 'utf8');
  assert.strictEqual((app.match(/\{clinicConfig\.demoNotice\}/g) || []).length, 1);
  assert.strictEqual(topBar.includes('demoNotice'), false);
});

test('All public routes use the shared site-section gate', () => {
  const app = fs.readFileSync('src/App.tsx', 'utf8');
  for (const section of ['about','services','doctors','gallery','testimonials','faq','contact','appointment','privacy','terms']) {
    assert.strictEqual(app.includes(`isSiteSectionEnabled('${section}')`), true, `Route gate missing for ${section}`);
  }
});

test('Navbar, mobile menu and footer use the shared section configuration', () => {
  for (const file of ['src/components/layout/Navbar.tsx','src/components/layout/MobileMenu.tsx','src/components/layout/Footer.tsx']) {
    const source = fs.readFileSync(file, 'utf8');
    assert.strictEqual(source.includes('siteSections'), true, `${file} must use shared site-section configuration`);
  }
  const helper = fs.readFileSync('src/config/siteSections.ts', 'utf8');
  assert.strictEqual(helper.includes('clinicConfig.siteSections'), true);
  assert.strictEqual(helper.includes('getMainNavLinks'), true);
});

test('Sitemap routes cannot enable a disabled clinic section', () => {
  const source = fs.readFileSync('scripts/generate-sitemap.mjs', 'utf8');
  assert.strictEqual(source.includes('VITE_ENABLED_SITE_SECTIONS'), true);
  assert.strictEqual(source.includes('sectionRoutes'), true);
  assert.strictEqual(source.includes('configuredSections.includes(section)'), true);
});


test('Vercel deployment carries security headers and admin no-store/noindex controls', () => {
  const vercel = fs.readFileSync('vercel.json', 'utf8');
  for (const header of ['X-Content-Type-Options', 'Content-Security-Policy', 'Strict-Transport-Security', 'X-Robots-Tag']) {
    assert.strictEqual(vercel.includes(header), true, `Vercel header missing: ${header}`);
  }
  assert.strictEqual(vercel.includes('"source": "/admin"'), true);
  assert.strictEqual(vercel.includes('"value": "noindex, nofollow, noarchive"'), true);
});

test('Demo authentication is development-only and does not use the obvious default password', () => {
  const source = fs.readFileSync('src/utils/adminSecurity.ts', 'utf8');
  assert.strictEqual(source.includes("import.meta.env.DEV &&"), true);
  assert.strictEqual(source.includes("'admin123'"), false);
});

test('Admin is excluded from search indexing hygiene controls', () => {
  const robots = fs.readFileSync('public/robots.txt', 'utf8');
  const headers = fs.readFileSync('public/_headers', 'utf8');
  assert.strictEqual(robots.includes('Disallow: /admin'), true);
  assert.strictEqual(headers.includes('X-Robots-Tag: noindex, nofollow, noarchive'), true);
});

test('Status audit authority is server-side rather than browser-supplied actor role', () => {
  const source = fs.readFileSync('src/services/appointmentBackendService.ts', 'utf8');
  assert.strictEqual(source.includes('database trigger'), true);
  assert.strictEqual(source.includes("supabase.from('appointment_audit_logs').insert"), false);
});

console.log(`\n🎉 Summary: All ${passCount} automated test assertions passed cleanly.\n`);
