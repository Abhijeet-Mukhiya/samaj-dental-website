# Production Setup — Samaj Dental Platform

## Required Supabase configuration

Set these frontend variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLINIC_ID`
- `VITE_APPOINTMENT_FUNCTION_URL`
- `VITE_AVAILABILITY_FUNCTION_URL`

Never put `SUPABASE_SERVICE_ROLE_KEY` in a `VITE_*` variable or browser code.

## Edge Function secrets

For `create-appointment` configure:

- `ALLOWED_ORIGIN` — exact public website origin, including scheme, without a trailing slash.
- Supabase's server-side `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets.

The create function uses the request's platform-provided forwarding IP metadata for the database rate limiter. Do not accept an IP address from the browser body.

For `get-availability`, `ALLOWED_ORIGIN` is also required. The function only returns public slot information.

## Doctor accounts

Each Supabase Auth doctor account must have a matching `clinic_users` row with:

- `role = 'doctor'`
- the correct `clinic_id`
- `doctor_id` pointing to the matching active doctor record

The platform intentionally does **not** match doctors by display name. This prevents ambiguous identity and authorization failures when two doctors share a name or a name changes.

## Scheduling

Real booking requires database configuration:

- `clinic_hours`
- `doctor_schedules` for a selected doctor
- `availability_exceptions` when applicable
- service duration in `services.duration_minutes`
- same-day slots whose start time has already passed in the clinic timezone are excluded

There is no production fallback to invented `08:00–20:00` hours.

## Appointment concurrency

Appointments store their effective duration and a generated PostgreSQL `tsrange`. A GiST exclusion constraint prevents overlapping pending/confirmed appointments for the same doctor, including different start times.

## Verification

Run:

```bash
npm run lint
npm test
npm run audit
npm run build
```

`npm run build` must be verified in a normal local/CI install. A pre-existing `node_modules` directory copied between operating systems can break Vite/Rollup optional native dependencies and should not be used as deployment evidence.


## Appointment lifecycle guardrails

Authenticated staff can update status and patient-safe fields, but direct browser updates cannot change the doctor, service, date, time, or effective duration. Scheduling changes must use `reschedule_appointment_secure`, which re-checks the real database schedule and interval availability inside the transaction.

Allowed status transitions are:

- pending → confirmed or cancelled
- confirmed → completed, cancelled, or no_show

Terminal statuses are not reopened by ordinary staff updates.

## Launch verification gate

Before real patient use, run the application from a clean dependency install and verify the Supabase migration in a fresh database. Then test at least two clinic identities for cross-tenant denial and a doctor identity for doctor-only appointment visibility. Also test two concurrent booking requests for the same doctor/time and confirm exactly one succeeds.

## Current Supabase demo deployment

This release is wired to the connected Supabase project used for the sales demo. The browser uses the project's publishable key and clinic UUID; no service-role/secret key belongs in the frontend.

The public appointment and availability Edge Functions are deployed as:

- `create-appointment`
- `get-availability`

They intentionally do not require a Supabase Auth JWT because patients can request appointments without creating an account. They instead require the publishable/anon API key, enforce an origin allow-list, validate input, rate-limit appointment creation, and delegate appointment creation to the server-side secure RPC.

For a real client deployment, set the Edge Function secret `ALLOWED_ORIGINS` to the exact production origins (comma-separated) and remove demo origins. Do not use `*` for a production clinic site.

## Demo data

Placeholder doctors, services, schedules and sample appointments are present so the sales demo is populated. Replace them with clinic-verified information before a real launch. Do not publish fabricated qualifications, reviews, prices, ratings or credentials.


## Frontend environment
Set `VITE_SITE_URL` to the final production origin when deploying. The SEO component falls back to the current origin for canonical URLs, while the sitemap build uses `VITE_SITE_URL`/`SITE_URL`.
