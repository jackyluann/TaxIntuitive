// Deno runtime (Supabase Edge Functions).
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function fail(message: string, status = 400): Response {
  return json({ error: message }, status);
}

/** Service-role client: bypasses RLS. Only ever used for validated, server-computed writes. */
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

/** Resolves the caller from their JWT. Every function requires a signed-in user. */
export async function requireUser(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return { user: null, error: 'Missing Authorization header' as const };

  const anon = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { auth: { persistSession: false }, global: { headers: { Authorization: authHeader } } },
  );
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return { user: null, error: 'Invalid session' as const };
  return { user: data.user, error: null };
}

export const QUESTIONS_PER_MATCH = 8;
export const SECONDS_PER_QUESTION = 20;
/** Points for a correct answer, before the speed bonus. */
export const BASE_POINTS = 100;
/** Maximum extra points for answering instantly. */
export const MAX_SPEED_BONUS = 50;
/** Extra points per consecutive correct answer, capped. */
export const STREAK_BONUS = 10;
export const MAX_STREAK_BONUS = 50;

export function scoreAnswer(isCorrect: boolean, elapsedMs: number, secondsPerQuestion: number, streak: number) {
  if (!isCorrect) return 0;
  const limit = secondsPerQuestion * 1000;
  const remaining = Math.max(0, limit - Math.max(0, elapsedMs));
  const speed = Math.round((remaining / limit) * MAX_SPEED_BONUS);
  const streakBonus = Math.min(MAX_STREAK_BONUS, streak * STREAK_BONUS);
  return BASE_POINTS + speed + streakBonus;
}
