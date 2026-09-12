import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { clinicConfig } from '../config/clinic';

export interface DoctorRecord {
  id: string;
  clinic_id: string;
  name: string;
  specialization: string;
  bio?: string;
  image?: string;
  active: boolean;
  availableDays: string[];
  title?: string;
  qualification?: string;
  experienceYears?: number;
  languages?: string[];
  memberships?: string[];
  education?: string[];
}

interface DoctorRow {
  id: string;
  clinic_id: string;
  name: string;
  specialization: string | null;
  bio: string | null;
  image: string | null;
  active: boolean;
  display_title?: string | null;
  qualification?: string | null;
  experience_years?: number | null;
  languages?: string[] | null;
  memberships?: string[] | null;
  education?: string[] | null;
}

const DEFAULT_CLINIC_ID = import.meta.env.VITE_CLINIC_ID || '';

export async function fetchDoctorsList(options: { includeInactive?: boolean } = {}): Promise<DoctorRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const clinicId = DEFAULT_CLINIC_ID;
    if (!clinicId) {
      console.error('VITE_CLINIC_ID is required for Supabase doctor queries.');
      return [];
    }

    // Public-facing catalog access goes through the narrow RPC, which exposes
    // only safe active doctor fields. Admin screens may request inactive rows
    // after authentication, where the RLS policy applies.
    if (!options.includeInactive) {
      const { data, error } = await supabase.rpc('get_public_doctors', { p_clinic_id: clinicId });
      if (error) {
        console.error('Supabase public doctor fetch failed:', error);
        return [];
      }
      return ((data || []) as Array<Omit<DoctorRow, 'clinic_id' | 'active'> & { available_days?: string[] }>).map((d) => ({
        id: d.id,
        clinic_id: clinicId,
        name: d.name,
        specialization: d.specialization || 'Dental Specialist',
        bio: d.bio || '',
        image: d.image || '',
        active: true,
        availableDays: d.available_days?.length ? d.available_days : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        title: d.display_title || 'Dental Professional',
        qualification: d.qualification || '',
        experienceYears: d.experience_years ?? undefined,
        languages: d.languages || [],
        memberships: d.memberships || [],
        education: d.education || [],
      }));
    }

    const { data, error } = await supabase
      .from('doctors')
      .select('id, clinic_id, name, specialization, bio, image, active, display_title, qualification, experience_years, languages, memberships, education')
      .eq('clinic_id', clinicId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase doctor fetch failed:', error);
      return [];
    }

    return ((data || []) as DoctorRow[]).map((d) => ({
      id: d.id,
      clinic_id: d.clinic_id,
      name: d.name,
      specialization: d.specialization || 'Dental Specialist',
      bio: d.bio || '',
      image: d.image || '',
      active: d.active,
      title: d.display_title || '', qualification: d.qualification || '', experienceYears: d.experience_years ?? undefined,
      languages: d.languages || [], memberships: d.memberships || [], education: d.education || [],
      availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    }));
  }

  // Development-only catalog. Production never falls back to browser storage.
  return clinicConfig.doctors.map((d, i) => ({
    id: d.id || `DOC-${i + 1}`,
    clinic_id: DEFAULT_CLINIC_ID,
    name: d.name,
    specialization: d.specialty,
    bio: d.bio,
    image: d.image,
    active: true,
    availableDays: d.availableDays || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  }));
}

export async function toggleDoctorActive(doctorId: string, nextState: boolean): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('doctors')
      .update({ active: nextState })
      .eq('id', doctorId);

    if (error) {
      console.error('Doctor update failed:', error);
      return false;
    }
    return true;
  }

  return true;
}

export interface DoctorWriteInput {
  clinicId: string;
  name: string;
  specialization?: string;
  bio?: string;
  image?: string;
  title?: string;
  qualification?: string;
  active?: boolean;
}

export async function createDoctor(input: DoctorWriteInput): Promise<DoctorRecord | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('doctors')
    .insert({
      clinic_id: input.clinicId,
      name: input.name.trim(),
      specialization: input.specialization?.trim() || null,
      bio: input.bio?.trim() || null,
      image: input.image?.trim() || null,
      display_title: input.title?.trim() || null,
      qualification: input.qualification?.trim() || null,
      active: input.active ?? true,
    })
    .select('id, clinic_id, name, specialization, bio, image, active, display_title, qualification, experience_years, languages, memberships, education')
    .single();
  if (error || !data) {
    console.error('Doctor creation failed:', error);
    return null;
  }
  const row = data as DoctorRow;
  return {
    id: row.id, clinic_id: row.clinic_id, name: row.name,
    specialization: row.specialization || 'Dental Specialist',
    bio: row.bio || '', image: row.image || '', active: row.active,
    availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  };
}

export async function updateDoctor(
  doctorId: string,
  patch: Partial<Omit<DoctorWriteInput, 'clinicId'>>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const payload = {
    ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
    ...(patch.specialization !== undefined ? { specialization: patch.specialization?.trim() || null } : {}),
    ...(patch.bio !== undefined ? { bio: patch.bio?.trim() || null } : {}),
    ...(patch.image !== undefined ? { image: patch.image?.trim() || null } : {}),
    ...(patch.title !== undefined ? { display_title: patch.title?.trim() || null } : {}),
    ...(patch.qualification !== undefined ? { qualification: patch.qualification?.trim() || null } : {}),
    ...(patch.active !== undefined ? { active: patch.active } : {}),
  };
  const { error } = await supabase.from('doctors').update(payload).eq('id', doctorId);
  if (error) console.error('Doctor update failed:', error);
  return !error;
}
