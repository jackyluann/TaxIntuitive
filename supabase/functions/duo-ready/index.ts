// Marks a player ready. When both are ready, the server starts the match.
import { adminClient, corsHeaders, fail, json, requireUser } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const { user, error } = await requireUser(req);
  if (!user) return fail(error ?? 'Unauthorized', 401);

  const body = await req.json().catch(() => null);
  const matchId = typeof body?.matchId === 'string' ? body.matchId : '';
  if (!matchId) return fail('matchId is required.');

  const db = adminClient();

  const { error: readyErr } = await db
    .from('duo_participants')
    .update({ ready: true, last_seen_at: new Date().toISOString() })
    .eq('match_id', matchId)
    .eq('user_id', user.id);
  if (readyErr) return fail(`Could not set ready: ${readyErr.message}`, 500);

  const { data: participants } = await db
    .from('duo_participants')
    .select('user_id, ready')
    .eq('match_id', matchId);

  const bothReady = (participants?.length ?? 0) === 2 && participants!.every((p) => p.ready);

  if (bothReady) {
    // Only transition once: the status guard makes concurrent calls safe.
    const { data: started } = await db
      .from('duo_matches')
      .update({
        status: 'active',
        current_index: 0,
        started_at: new Date().toISOString(),
        question_started_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .in('status', ['waiting', 'ready'])
      .select('id')
      .maybeSingle();
    return json({ ready: true, started: Boolean(started) });
  }

  await db.from('duo_matches').update({ status: 'ready' }).eq('id', matchId).eq('status', 'waiting');
  return json({ ready: true, started: false });
});
