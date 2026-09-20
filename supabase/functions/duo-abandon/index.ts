// Leaves a match. If it never started, it's abandoned; if it was live, the other player wins.
import { adminClient, corsHeaders, fail, json, requireUser } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const { user, error } = await requireUser(req);
  if (!user) return fail(error ?? 'Unauthorized', 401);

  const body = await req.json().catch(() => null);
  const matchId = typeof body?.matchId === 'string' ? body.matchId : '';
  if (!matchId) return fail('matchId is required.');

  const db = adminClient();
  const { data: match } = await db.from('duo_matches').select('*').eq('id', matchId).maybeSingle();
  if (!match) return fail('Match not found.', 404);
  if (match.host_id !== user.id && match.guest_id !== user.id) return fail('Not your match.', 403);
  if (match.status === 'finished') return json({ status: 'finished' });

  const otherId = match.host_id === user.id ? match.guest_id : match.host_id;

  if (match.status === 'active' && otherId) {
    await db
      .from('duo_matches')
      .update({
        status: 'finished',
        ended_at: new Date().toISOString(),
        winner_id: otherId,
        is_tie: false,
      })
      .eq('id', matchId);
    return json({ status: 'finished', winnerId: otherId, forfeited: true });
  }

  await db
    .from('duo_matches')
    .update({ status: 'abandoned', ended_at: new Date().toISOString() })
    .eq('id', matchId);
  return json({ status: 'abandoned' });
});
