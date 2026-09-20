import { contact } from '@/content';
import { supabase } from '@/lib/supabase/client';

export interface WorkshopRequestInput {
  contactName: string;
  contactEmail: string;
  organization?: string;
  preferredDate?: string;
  message: string;
}

export interface ContactMessageInput {
  contactEmail: string;
  subject?: string;
  message: string;
}

export type SubmitResult =
  | { ok: true; via: 'supabase' }
  | { ok: false; reason: 'unconfigured' | 'error'; fallbackMailto: string; message?: string };

const mailto = (subject: string, body: string) =>
  `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/**
 * Submits a workshop request. When Supabase isn't configured (or the insert fails) the caller gets
 * a mailto: fallback so a real person can still be reached — the form is never a dead end.
 */
export async function submitWorkshopRequest(
  input: WorkshopRequestInput,
  userId?: string,
): Promise<SubmitResult> {
  const body = [
    `Name: ${input.contactName}`,
    `Email: ${input.contactEmail}`,
    input.organization ? `School / organization: ${input.organization}` : null,
    input.preferredDate ? `Preferred date: ${input.preferredDate}` : null,
    '',
    input.message,
  ]
    .filter(Boolean)
    .join('\n');
  const fallbackMailto = mailto('TaxIntuitive workshop request', body);

  if (!supabase) return { ok: false, reason: 'unconfigured', fallbackMailto };

  const { error } = await supabase.from('workshop_requests').insert({
    user_id: userId ?? null,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    organization: input.organization ?? null,
    preferred_date: input.preferredDate ?? null,
    message: input.message,
  });
  if (error) return { ok: false, reason: 'error', fallbackMailto, message: error.message };
  return { ok: true, via: 'supabase' };
}

export async function submitContactMessage(
  input: ContactMessageInput,
  userId?: string,
): Promise<SubmitResult> {
  const fallbackMailto = mailto(input.subject ?? 'TaxIntuitive question', input.message);
  if (!supabase) return { ok: false, reason: 'unconfigured', fallbackMailto };

  const { error } = await supabase.from('contact_messages').insert({
    user_id: userId ?? null,
    contact_email: input.contactEmail,
    subject: input.subject ?? null,
    message: input.message,
  });
  if (error) return { ok: false, reason: 'error', fallbackMailto, message: error.message };
  return { ok: true, via: 'supabase' };
}

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
