// Permanently deletes the caller's account. Progress rows cascade from auth.users.
import { adminClient, corsHeaders, fail, json, requireUser } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const { user, error } = await requireUser(req);
  if (!user) return fail(error ?? 'Unauthorized', 401);

  const db = adminClient();

  // End any live matches first so an opponent isn't left waiting forever.
  await db
    .from('duo_matches')
    .update({ status: 'abandoned', ended_at: new Date().toISOString() })
    .in('status', ['waiting', 'ready', 'active'])
    .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`);

  // Every progress table references auth.users with ON DELETE CASCADE.
  const { error: delErr } = await db.auth.admin.deleteUser(user.id);
  if (delErr) return fail(`Could not delete account: ${delErr.message}`, 500);

  return json({ deleted: true });
});
