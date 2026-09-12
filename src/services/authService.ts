import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getAdminSession, createAdminSession, clearAdminSession, getDemoAdminPassword, isDemoAdminEnabled } from '../utils/adminSecurity';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'receptionist' | 'doctor';
  clinicId: string;
  doctorId?: string;
}

export async function loginWithEmailAndPassword(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
  // If Supabase is configured, use real Supabase Auth
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'Authentication failed.' };

      // Fetch user profile & clinic isolation identity from clinic_users
      const { data: profileData, error: profileError } = await supabase
        .from('clinic_users')
        .select('id, clinic_id, name, role, doctor_id')
        .eq('id', data.user.id)
        .single();


      if (profileError) {
        console.error('Clinic profile lookup failed:', profileError);

        return {
          user: null,
          error: `Clinic profile lookup failed: ${profileError.message}`,
        };
      }

      if (!profileData) {
        return {
          user: null,
          error: 'Staff account found, but no clinic profile assigned. Contact administrator.',
        };
      }

      const user: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        name: profileData.name,
        role: profileData.role as UserProfile['role'],
        clinicId: profileData.clinic_id,
        doctorId: profileData.doctor_id || undefined,
      };

      createAdminSession(user.role);
      return { user, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed due to network or server error.';
      return { user: null, error: msg };
    }
  }

  // Development-only fallback; production Supabase Auth has already returned above.
  if (isDemoAdminEnabled()) {
    if (password === getDemoAdminPassword()) {
      createAdminSession('admin');
      return {
        user: {
          id: 'demo-admin-id',
          email: email || 'admin@samajdental.com',
          name: 'Clinic Administrator',
          role: 'admin',
          clinicId: import.meta.env.VITE_CLINIC_ID || 'demo-clinic',
        },
        error: null,
      };
    }
    return { user: null, error: 'Invalid demo password.' };
  }

  return { user: null, error: 'Authentication service unavailable.' };
}

export async function logoutStaff(): Promise<void> {
  clearAdminSession();
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}

export async function getCurrentStaffUser(): Promise<UserProfile | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profileData } = await supabase
        .from('clinic_users')
        .select('id, clinic_id, name, role, doctor_id')
        .eq('id', session.user.id)
        .single();

      if (!profileData) return null;

      return {
        id: session.user.id,
        email: session.user.email || '',
        name: profileData.name,
        role: profileData.role as UserProfile['role'],
        clinicId: profileData.clinic_id,
        doctorId: profileData.doctor_id || undefined,
      };
    } catch {
      return null;
    }
  }

  // Development-only local session state. Production uses Supabase Auth above.
  const session = getAdminSession();
  if (session) {
    return {
      id: 'demo-admin-id',
      email: 'admin@samajdental.com',
      name: 'Clinic Staff',
      role: session.role,
      clinicId: import.meta.env.VITE_CLINIC_ID || 'demo-clinic',
    };
  }

  return null;
}
