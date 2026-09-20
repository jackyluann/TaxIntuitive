// Joins an existing Quiz Duo match by room code.
import { adminClient, corsHeaders, fail, json, requireUser } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const { user, error } = await requireUser(req);
  if (!user) return fail(error ?? 'Unauthorized', 401);

  const body = await req.json().catch(() => null);
  const roomCode = typeof body?.roomCode === 'string' ? body.roomCode.trim().toUpperCase() : '';
  if (!roomCode) return fail('A room code is required.');

  const db = adminClient();
  const { data: match, error: mErr } = await db
    .from('duo_matches')
    .select('*')
    .eq('room_code', roomCode)
    .maybeSingle();

  if (mErr) return fail(`Lookup failed: ${mErr.message}`, 500);
  if (!match) return fail('No match found with that code.', 404);

  // Rejoining your own match is always allowed — this is how reconnection works.
  const isParticipant = match.host_id === user.id || match.guest_id === user.id;
  if (!isParticipant) {
    if (new Date(match.expires_at).getTime() < Date.now()) return fail('That room has expired.', 410);
    if (match.status !== 'waiting') return fail('That match has already started.', 409);
    if (match.guest_id) return fail('That match is already full.', 409);
  }

  const name =
    (typeof body?.displayName === 'string' && body.displayName.trim()) ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Player';

  if (!isParticipant) {
    const { error: updErr } = await db
      .from('duo_matches')
      .update({ guest_id: user.id })
      .eq('id', match.id)
      .eq('status', 'waiting')
      .is('guest_id', null);
    if (updErr) return fail(`Could not join: ${updErr.message}`, 500);

    const { error: pErr } = await db.from('duo_participants').insert({
      match_id: match.id,
      user_id: user.id,
      display_name: name,
      role: 'guest',
      ready: false,
    });
    if (pErr) return fail(`Could not join: ${pErr.message}`, 500);
  } else {
    // Reconnect: refresh presence.
    await db
      .from('duo_participants')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('match_id', match.id)
      .eq('user_id', user.id);
  }

  return json({ matchId: match.id, roomCode: match.room_code, rejoined: isParticipant });
});
