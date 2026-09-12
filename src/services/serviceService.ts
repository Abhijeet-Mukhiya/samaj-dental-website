import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { clinicConfig } from '../config/clinic';

export interface ServiceRecord {
  id: string;
  clinic_id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  price?: string;
  active: boolean;
  iconName?: string;
  image?: string;
  shortDescription?: string;
  fullDescription?: string;
  benefits?: string[];
}

interface ServiceRow {
  id: string;
  clinic_id: string;
  name: string;
  description: string | null;
  duration_minutes: number | null;
  price: number | null;
  active: boolean;
  category?: string | null;
  icon_name?: string | null;
  image?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  benefits?: string[] | null;
}

const DEFAULT_CLINIC_ID = import.meta.env.VITE_CLINIC_ID || '';

export async function fetchServicesList(options: { includeInactive?: boolean } = {}): Promise<ServiceRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const clinicId = DEFAULT_CLINIC_ID;
    if (!clinicId) {
      console.error('VITE_CLINIC_ID is required for Supabase service queries.');
      return [];
    }

    // Public-facing catalog access goes through the narrow RPC. Admin screens
    // may request inactive rows after authentication, subject to RLS.
    if (!options.includeInactive) {
      const { data, error } = await supabase.rpc('get_public_services', { p_clinic_id: clinicId });
      if (error) {
        console.error('Supabase public service fetch failed:', error);
        return [];
      }
      return ((data || []) as Array<{ id: string; name: string; description: string | null; duration_minutes: number | null; price: number | null; category?: string | null; icon_name?: string | null; image?: string | null; short_description?: string | null; full_description?: string | null; benefits?: string[] | null }>).map((s) => ({
        id: s.id,
        clinic_id: clinicId,
        name: s.name,
        category: s.category || 'General',
        description: s.description || '',
        duration: `${s.duration_minutes || 30} mins`,
        price: s.price !== null ? `NPR ${s.price}` : 'Contact clinic',
        active: true,
        iconName: s.icon_name || 'Smile',
        image: s.image || '',
        shortDescription: s.short_description || s.description || '',
        fullDescription: s.full_description || s.description || '',
        benefits: s.benefits || [],
      }));
    }

    const { data, error } = await supabase
      .from('services')
      .select('id, clinic_id, name, description, duration_minutes, price, active, category, icon_name, image, short_description, full_description, benefits')
      .eq('clinic_id', clinicId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase service fetch failed:', error);
      return [];
    }

    return ((data || []) as ServiceRow[]).map((s) => ({
      id: s.id,
      clinic_id: s.clinic_id,
      name: s.name,
      category: s.category || 'General',
      description: s.description || '',
      duration: `${s.duration_minutes || 30} mins`,
      price: s.price !== null ? `NPR ${s.price}` : 'Contact clinic',
      active: s.active,
      iconName: s.icon_name || 'Smile',
      image: s.image || '',
      shortDescription: s.short_description || s.description || '',
      fullDescription: s.full_description || s.description || '',
      benefits: s.benefits || [],
    }));
  }

  // Development-only catalog. Production never falls back to browser storage.
  return clinicConfig.services.map((s) => ({
    id: s.id,
    clinic_id: DEFAULT_CLINIC_ID,
    name: s.title,
    category: s.category,
    description: s.shortDescription,
    duration: s.duration,
    price: s.priceRange,
    active: true,
  }));
}

export async function toggleServiceActive(serviceId: string, nextState: boolean): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('services')
      .update({ active: nextState })
      .eq('id', serviceId);

    if (error) {
      console.error('Service update failed:', error);
      return false;
    }
    return true;
  }

  return true;
}

export interface ServiceWriteInput {
  clinicId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price?: number | null;
  active?: boolean;
}

export async function createService(input: ServiceWriteInput): Promise<ServiceRecord | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('services')
    .insert({
      clinic_id: input.clinicId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      duration_minutes: input.durationMinutes,
      price: input.price ?? null,
      active: input.active ?? true,
    })
    .select('id, clinic_id, name, description, duration_minutes, price, active')
    .single();
  if (error || !data) {
    console.error('Service creation failed:', error);
    return null;
  }
  const row = data as ServiceRow;
  return {
    id: row.id, clinic_id: row.clinic_id, name: row.name, category: 'General',
    description: row.description || '', duration: `${row.duration_minutes || 30} mins`,
    price: row.price !== null ? `NPR ${row.price}` : 'Contact clinic', active: row.active,
  };
}

export async function updateService(
  serviceId: string,
  patch: Partial<Omit<ServiceWriteInput, 'clinicId'>>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const payload = {
    ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
    ...(patch.description !== undefined ? { description: patch.description?.trim() || null } : {}),
    ...(patch.durationMinutes !== undefined ? { duration_minutes: patch.durationMinutes } : {}),
    ...(patch.price !== undefined ? { price: patch.price } : {}),
    ...(patch.active !== undefined ? { active: patch.active } : {}),
  };
  const { error } = await supabase.from('services').update(payload).eq('id', serviceId);
  if (error) console.error('Service update failed:', error);
  return !error;
}


export function serviceRecordToDisplayService(record: ServiceRecord): import('../types/clinic').Service {
  const configured = clinicConfig.services.find((service) =>
    service.title.toLowerCase() === record.name.toLowerCase() ||
    record.name.toLowerCase().includes(service.title.toLowerCase()) ||
    service.title.toLowerCase().includes(record.name.toLowerCase())
  );

  const categoryMap: Record<string, import('../types/clinic').Service['category']> = {
    cleaning: 'General', filling: 'General', 'root canal': 'General', extraction: 'Surgical', cosmetic: 'Cosmetic', orthodontic: 'Orthodontics', pediatric: 'Pediatric',
  };
  const category = (record.category as import('../types/clinic').Service['category']) || configured?.category || Object.entries(categoryMap).find(([keyword]) => record.name.toLowerCase().includes(keyword))?.[1] || 'General';

  return {
    ...(configured || {}),
    id: record.id,
    title: record.name,
    category,
    shortDescription: record.shortDescription || configured?.shortDescription || record.description || 'A dental service currently listed by the clinic.',
    fullDescription: record.fullDescription || configured?.fullDescription || record.description || 'Treatment suitability is determined after professional assessment.',
    iconName: record.iconName || configured?.iconName || 'Smile',
    duration: record.duration,
    priceRange: record.price || configured?.priceRange || 'Contact clinic for current pricing',
    image: record.image || configured?.image || clinicConfig.services[0]?.image || '',
    benefits: record.benefits?.length ? record.benefits : (configured?.benefits || ['Professional assessment', 'Clear treatment planning', 'Follow-up guidance']),
    procedures: configured?.procedures || [
      { title: 'Consultation', description: 'Discuss your dental concern with the clinic team.' },
      { title: 'Assessment', description: 'A dental professional determines the appropriate treatment approach.' },
      { title: 'Care & Follow-up', description: 'Treatment and follow-up are planned according to clinical needs.' },
    ],
    isFeatured: configured?.isFeatured ?? true,
  };
}
