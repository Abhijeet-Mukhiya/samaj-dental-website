/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_CLINIC_ID?: string;
  readonly VITE_APPOINTMENT_FUNCTION_URL?: string;
  readonly VITE_AVAILABILITY_FUNCTION_URL?: string;
  readonly VITE_DEMO_ADMIN_ENABLED?: string;
  readonly VITE_DEMO_ADMIN_PASSWORD?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
