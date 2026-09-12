# Security Checklist — Samaj Dental Demo

This document maps the project against the security checklist used in the September 2026 review. It distinguishes **implemented controls** from **deployment verification**. A control being present in source code does not prove the live Supabase project or hosting account is configured correctly.

## Implemented in the codebase

| Control | Status | Notes |
|---|---|---|
| Remove unused packages | REVIEW REQUIRED | Dependency inventory should be reviewed periodically; do not run force upgrades blindly. |
| Check Git for secrets | PASS / PROCESS | `.gitignore` excludes `.env*` except `.env.example`; never commit service-role keys. Run a secret scanner before client handoff. |
| Rate limiting | PASS | Appointment creation uses a database-backed atomic rate limiter (10 requests / 60 seconds / IP + endpoint). |
| User access control | PASS IN CODE | Supabase Auth + `clinic_users` role and clinic scope + RLS. Live negative tests still required. |
| Password hashing | PASS BY PROVIDER | Staff passwords are delegated to Supabase Auth; the app never stores or hashes staff passwords itself. |
| Hide API keys | PASS WITH CAVEAT | `VITE_SUPABASE_ANON_KEY`/publishable key is intentionally browser-visible. It is not a secret. Service-role credentials are server-side only. |
| Proper authentication | PASS IN CODE | Supabase Auth is used when configured. Demo authentication is now strictly development-only. |
| Update dependencies | REVIEW REQUIRED | Lockfile is committed. Run `npm ci` + `npm audit` in a networked CI/Windows environment before release. |
| Sanitize/validate forms | PASS | Client and server validation cover name, phone, email, date/time, message length, consent, clinic/doctor/service ownership. |
| Protect against XSS | PASS BASELINE | React escaping is used; no `dangerouslySetInnerHTML` was found in application source. CSP also restricts scripts. |
| Disable debug mode | PASS BASELINE | No production debug flag is shipped; console output is limited to operational error handling. |
| Check env variables | PASS | Frontend uses only `VITE_*` public values. Service-role secrets are documented for Edge Functions only. |
| Check exposed files | PASS BASELINE | Build artifacts/dependencies/env files are ignored; admin responses are marked no-store/noindex. |
| Protect admin routes | PASS IN CODE | `/admin` is a separate route and requires staff authentication before dashboard data is loaded. RLS remains the real authorization boundary. |
| Secure API endpoints | PASS IN CODE | Public appointment/availability functions use method checks, API-key checks, origin allow-listing, validation, rate limiting, and narrow RPCs. |
| CORS settings | PASS IN CODE | Edge Functions use configurable exact origins; production must not use `*`. |
| Security headers | PASS | Netlify `_headers` and Vercel `vercel.json` both include baseline security headers and CSP. |
| Secure database access | PASS IN CODE | RLS is enabled on application tables; public access uses narrow RPCs; sensitive backend tables have no browser-facing policies. |
| Audit logging | PASS | Appointment changes are audited server-side using database triggers and authenticated actor role, rather than trusting browser-supplied role text. |
| Appointment race protection | PASS | PostgreSQL GiST exclusion constraint blocks overlapping pending/confirmed appointments for the same doctor. |
| Tenant isolation | PASS IN CODE | Clinic scope is derived from the authenticated `clinic_users` record; doctor access is mapped by stable `doctor_id`. |

## Important limitations

### 1. Browser-visible Supabase key
A Supabase publishable/anon key is expected to be visible in a browser application. **Do not treat it like a password.** Security comes from RLS, narrow RPCs, validation, and server-side secrets.

### 2. Demo authentication
The local demo login is a UI-development convenience, not a production authentication system. It is restricted to `import.meta.env.DEV` and must not be used for real clinic staff.

### 3. Public appointment functions
Patients do not have Auth accounts, so the appointment Edge Function intentionally runs without a JWT requirement. Abuse protection therefore depends on the origin allow-list, public API key check, validation, rate limiting, and database constraints. For a high-traffic deployment, consider adding a managed bot/challenge control such as Turnstile or equivalent.

### 4. Live Supabase verification is still a launch gate
Before accepting real patient information, verify:
- RLS with at least two clinic identities, including cross-clinic denial.
- Doctor account can see only appointments assigned to its `doctor_id`.
- Receptionist cannot modify staff roles or bypass scheduling restrictions.
- Admin-only doctor/service/staff management works.
- Two concurrent booking requests for the same overlapping interval produce exactly one successful booking.
- Edge Function `ALLOWED_ORIGINS` contains only the real production origin(s).
- Service-role key exists only in server-side Edge Function secrets.
- Auth email/password policies and account recovery are configured appropriately.
- Database backups, retention, and incident procedures are configured for the clinic's requirements.

## Production release commands

Run from a clean checkout:

```bash
npm ci
npm run lint
npm test
npm run audit
npm run build
```

Also run a secret scanner and dependency audit in CI. Do not use a copied `node_modules` directory as proof of a clean install.

## No compliance claim

Technical controls in this template do not by themselves make a clinic website HIPAA, GDPR, or otherwise legally compliant. The clinic should obtain appropriate privacy/security/legal review for its jurisdiction and data practices.
