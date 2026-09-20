// Creates a Quiz Duo match and returns its room code.
import {
  adminClient,
  corsHeaders,
  fail,
  json,
  QUESTIONS_PER_MATCH,
  requireUser,
  SECONDS_PER_QUESTION,
} from '../_shared/supabase.ts';

/** Ambiguous characters (0/O, 1/I) are excluded so codes are easy to read aloud. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const { user, error } = await requireUser(req);
  if (!user) return fail(error ?? 'Unauthorized', 401);

  const db = adminClient();

  const { displayName } = await req.json().catch(() => ({ displayName: null }));
  const name =
    (typeof displayName === 'string' && displayName.trim()) ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Player';

  // Pick the question set up front so both players are guaranteed identical questions.
  const { data: questions, error: qErr } = await db
    .from('content_questions')
    .select('id')
    .eq('published', true);
  if (qErr) return fail(`Could not load questions: ${qErr.message}`, 500);
  if (!questions?.length) return fail('No questions are available for a match.', 503);

  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const questionIds = shuffled.slice(0, Math.min(QUESTIONS_PER_MATCH, shuffled.length)).map((q) => q.id);

  // Retry on the (very unlikely) room-code collision.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const roomCode = makeCode();
    const { data: match, error: insErr } = await db
      .from('duo_matches')
      .insert({
        room_code: roomCode,
        host_id: user.id,
        status: 'waiting',
        question_ids: questionIds,
        seconds_per_question: SECONDS_PER_QUESTION,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      })
      .select('*')
      .single();

    if (insErr) {
      if (insErr.code === '23505' || insErr.message.includes('duplicate')) continue;
      return fail(`Could not create match: ${insErr.message}`, 500);
    }

    const { error: partErr } = await db.from('duo_participants').insert({
      match_id: match.id,
      user_id: user.id,
      display_name: name,
      role: 'host',
      ready: false,
    });
    if (partErr) return fail(`Could not join own match: ${partErr.message}`, 500);

    return json({ matchId: match.id, roomCode: match.room_code, questionCount: questionIds.length });
  }

  return fail('Could not allocate a room code. Please try again.', 500);
});
