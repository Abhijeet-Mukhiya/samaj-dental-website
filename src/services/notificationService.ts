import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface NotificationPayload {
  clinicId?: string;
  recipientType: 'patient' | 'clinic';
  recipientContact: string;
  channel: 'email' | 'whatsapp';
  title: string;
  message: string;
}

export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  const clinicId = payload.clinicId || 'a1010101-1010-1010-1010-101010101010';

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('notifications').insert({
        clinic_id: clinicId,
        recipient_type: payload.recipientType,
        recipient_contact: payload.recipientContact,
        channel: payload.channel,
        title: payload.title,
        message: payload.message,
        status: 'pending',
      });
      if (!error) return true;
    } catch (e) {
      console.warn('Failed to record notification in Supabase:', e);
    }
  }

  // Development / fallback abstraction logging
  if (import.meta.env.DEV) {
    console.log(`[NotificationProvider:${payload.channel.toUpperCase()}] To: ${payload.recipientContact} | ${payload.title}: ${payload.message}`);
  }
  return true;
}
