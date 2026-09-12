# Client Handoff & Customization Guide

## Quick demo setup
1. Copy `.env.demo` to `.env` for the connected demonstration environment.
2. Run `npm ci`.
3. Run `npm run dev`.
4. Use `/doctors`, `/services`, `/appointment`, and `/admin` to demonstrate the workflow.

## For a real clinic
Create or use a dedicated Supabase project for the client. Do not reuse the demo clinic database for unrelated clients.

Set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLINIC_ID`
- `VITE_SITE_URL`

Keep service-role credentials only in Supabase/Edge Function secrets.

Replace all sample content with clinic-approved data:
- clinic name/contact/location/hours
- doctors and verified qualifications
- services and pricing
- clinic images
- genuine patient reviews with permission
- social links and map

Set the Edge Function `ALLOWED_ORIGINS` secret to the exact production domain(s).
