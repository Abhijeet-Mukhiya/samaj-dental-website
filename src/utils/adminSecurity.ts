const SESSION_KEY = 'samaj_admin_session';
const ATTEMPTS_KEY = 'samaj_admin_login_attempts';
const SESSION_TTL_MS = 30 * 60 * 1000;
const LOCKOUT_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface AdminSession { issuedAt: number; lastActivity: number; role: 'admin' | 'receptionist' | 'doctor' }
interface LoginAttempts { count: number; lockedUntil: number }

const safeRead = <T,>(storage: Storage, key: string): T | null => {
  try { const raw = storage.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
};

export function isDemoAdminEnabled(): boolean {
  // Demo access is intentionally available during local development, but disabled in production
  // unless explicitly enabled. This prevents accidentally shipping a client-side demo login.
  return import.meta.env.DEV && import.meta.env.VITE_DEMO_ADMIN_ENABLED !== 'false';
}

export function getDemoAdminPassword(): string {
  return import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'demo-only-change-me';
}

export function getAdminSession(): AdminSession | null {
  const session = safeRead<AdminSession>(sessionStorage, SESSION_KEY);
  if (!session) return null;
  if (Date.now() - session.lastActivity > SESSION_TTL_MS) {
    clearAdminSession();
    return null;
  }
  return session;
}

export function touchAdminSession(): void {
  const session = getAdminSession();
  if (!session) return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, lastActivity: Date.now() }));
}

export function createAdminSession(role: AdminSession['role'] = 'admin'): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ issuedAt: Date.now(), lastActivity: Date.now(), role }));
  sessionStorage.removeItem(ATTEMPTS_KEY);
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function loginBlocked(): number {
  const attempts = safeRead<LoginAttempts>(sessionStorage, ATTEMPTS_KEY);
  if (!attempts) return 0;
  if (attempts.lockedUntil <= Date.now()) {
    sessionStorage.removeItem(ATTEMPTS_KEY);
    return 0;
  }
  return attempts.lockedUntil - Date.now();
}

export function recordFailedLogin(): number {
  const current = safeRead<LoginAttempts>(sessionStorage, ATTEMPTS_KEY) || { count: 0, lockedUntil: 0 };
  const count = current.count + 1;
  const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
  sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count, lockedUntil }));
  return lockedUntil > Date.now() ? lockedUntil - Date.now() : 0;
}

export const ADMIN_SESSION_TTL_MINUTES = SESSION_TTL_MS / 60000;
