# Samaj Dental — Deployment Fixes

This release fixes the deployed demo configuration that caused:

- `Authentication service unavailable` on `/admin`
- empty appointment time slots
- Google Fonts CSP errors

## Frontend / Netlify

The build now explicitly uses the connected demo environment:

- `npm run build` -> `vite build --mode demo`
- `netlify.toml` contains the browser-safe publishable Supabase URL/key and clinic ID
- `public/_headers` allows `https://fonts.googleapis.com` in `style-src`

No Supabase service-role key is included in the frontend configuration.

## Supabase Edge Functions

The two public appointment functions in this release:

- `supabase/functions/get-availability/index.ts`
- `supabase/functions/create-appointment/index.ts`

now include the current Netlify demo origin in their fallback CORS allow-list and the frontend sends both `apikey` and `Authorization: Bearer <publishable-key>`.

If these functions are already deployed in Supabase, redeploy them from this folder so the updated CORS code is actually live.

Example from the project root after installing/logging into the Supabase CLI:

```powershell
supabase functions deploy get-availability
supabase functions deploy create-appointment
```

For the hosted Supabase project, prefer an explicit `ALLOWED_ORIGINS` environment/secret containing the exact production origin(s), for example:

```text
https://poetic-churros-8ac9f5.netlify.app
```

Do not use `*` for the real clinic deployment.

## Appointment availability resilience

The browser first calls the `get-availability` Edge Function. If that endpoint is unavailable or returns a non-2xx response, the browser now falls back to the narrow `get_available_slots` Supabase RPC.

The fallback is still database-authoritative. It does **not** generate fake local slots.

## Database requirement

The Supabase database must contain the schema and demo seed data from:

- `supabase/schema.sql`
- `supabase/seed.sql`

The seed contains clinic hours and doctor schedules used by availability calculation. Existing appointments, service duration, breaks, exceptions, and schedule boundaries remain authoritative.

## Important security note

The value named `VITE_SUPABASE_ANON_KEY` is a browser-safe publishable/anon key. It is not a service-role key. Never add `SUPABASE_SERVICE_ROLE_KEY` to `VITE_*` variables or frontend source.
