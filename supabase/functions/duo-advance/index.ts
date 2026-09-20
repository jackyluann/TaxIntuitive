// Advances a match when both players have answered, or when the timer has expired.
// Either client may call it; the server decides whether an advance is actually allowed.
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
  if (match.status !== 'active') return json({ advanced: false, status: match.status });

  const questionIds = (match.question_ids ?? []) as string[];

  const { data: answers } = await db
    .from('duo_answers')
    .select('user_id')
    .eq('match_id', matchId)
    .eq('question_index', match.current_index);

  const startedAt = match.question_started_at ? new Date(match.question_started_at).getTime() : 0;
  const expired = Date.now() - startedAt > match.seconds_per_question * 1000 + 1500;
  const bothAnswered = (answers?.length ?? 0) >= 2;

  if (!bothAnswered && !expired) {
    return json({ advanced: false, waitingFor: 2 - (answers?.length ?? 0) });
  }

  const nextIndex = match.current_index + 1;

  if (nextIndex >= questionIds.length) {
    const { data: participants } = await db
      .from('duo_participants')
      .select('user_id, score')
      .eq('match_id', matchId);

    let winnerId: string | null = null;
    let isTie = false;
    if (participants && participants.length === 2) {
      const [a, b] = participants;
      if (a.score === b.score) isTie = true;
      else winnerId = a.score > b.score ? a.user_id : b.user_id;
    }

    await db
      .from('duo_matches')
      .update({
        status: 'finished',
        ended_at: new Date().toISOString(),
        winner_id: winnerId,
        is_tie: isTie,
      })
      .eq('id', matchId)
      .eq('status', 'active');

    return json({ advanced: true, finished: true, winnerId, isTie });
  }

  // Guarded on current_index so two simultaneous callers can't skip a question.
  const { data: updated } = await db
    .from('duo_matches')
    .update({ current_index: nextIndex, question_started_at: new Date().toISOString() })
    .eq('id', matchId)
    .eq('current_index', match.current_index)
    .eq('status', 'active')
    .select('current_index')
    .maybeSingle();

  return json({ advanced: Boolean(updated), currentIndex: updated?.current_index ?? nextIndex });
});
