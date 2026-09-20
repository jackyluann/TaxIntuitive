// Validates and scores one Quiz Duo answer. The client is never trusted for correctness,
// timing, or points.
import {
  adminClient,
  corsHeaders,
  fail,
  json,
  requireUser,
  scoreAnswer,
} from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const { user, error } = await requireUser(req);
  if (!user) return fail(error ?? 'Unauthorized', 401);

  const body = await req.json().catch(() => null);
  const matchId = typeof body?.matchId === 'string' ? body.matchId : '';
  const questionIndex = Number.isInteger(body?.questionIndex) ? body.questionIndex : -1;
  // null = ran out of time without answering.
  const chosenIndex =
    body?.chosenIndex === null || body?.chosenIndex === undefined
      ? null
      : Number.isInteger(body.chosenIndex)
        ? body.chosenIndex
        : -1;

  if (!matchId || questionIndex < 0 || chosenIndex === -1) return fail('Invalid payload.');

  const db = adminClient();

  const { data: match, error: mErr } = await db
    .from('duo_matches')
    .select('*')
    .eq('id', matchId)
    .maybeSingle();
  if (mErr) return fail(mErr.message, 500);
  if (!match) return fail('Match not found.', 404);
  if (match.host_id !== user.id && match.guest_id !== user.id) return fail('Not your match.', 403);
  if (match.status !== 'active') return fail('This match is not active.', 409);
  if (questionIndex !== match.current_index) return fail('That question has already passed.', 409);

  const questionIds = (match.question_ids ?? []) as string[];
  const questionId = questionIds[questionIndex];
  if (!questionId) return fail('No such question in this match.', 409);

  // Server-side timing: the client's own clock is ignored entirely.
  const startedAt = match.question_started_at ? new Date(match.question_started_at).getTime() : Date.now();
  const elapsedMs = Date.now() - startedAt;
  const limitMs = match.seconds_per_question * 1000;
  // Small grace window for network latency.
  const timedOut = elapsedMs > limitMs + 1500;

  const { data: question, error: qErr } = await db
    .from('content_questions')
    .select('id, answer_index, explanation')
    .eq('id', questionId)
    .maybeSingle();
  if (qErr) return fail(qErr.message, 500);
  if (!question) return fail('Question not found.', 500);

  const { data: participant } = await db
    .from('duo_participants')
    .select('score, correct_count, streak')
    .eq('match_id', matchId)
    .eq('user_id', user.id)
    .maybeSingle();

  const isCorrect = !timedOut && chosenIndex !== null && chosenIndex === question.answer_index;
  const priorStreak = participant?.streak ?? 0;
  const points = scoreAnswer(isCorrect, elapsedMs, match.seconds_per_question, priorStreak);

  // The unique (match, user, question_index) constraint makes a duplicate submission a no-op.
  const { error: ansErr } = await db.from('duo_answers').insert({
    match_id: matchId,
    user_id: user.id,
    question_index: questionIndex,
    question_id: questionId,
    chosen_index: timedOut ? null : chosenIndex,
    is_correct: isCorrect,
    answered_ms: Math.max(0, Math.min(elapsedMs, limitMs)),
    awarded_points: points,
  });
  if (ansErr) {
    if (ansErr.code === '23505') return fail('You already answered this question.', 409);
    return fail(ansErr.message, 500);
  }

  await db
    .from('duo_participants')
    .update({
      score: (participant?.score ?? 0) + points,
      correct_count: (participant?.correct_count ?? 0) + (isCorrect ? 1 : 0),
      streak: isCorrect ? priorStreak + 1 : 0,
      last_seen_at: new Date().toISOString(),
    })
    .eq('match_id', matchId)
    .eq('user_id', user.id);

  return json({
    isCorrect,
    correctIndex: question.answer_index,
    explanation: question.explanation,
    awardedPoints: points,
    timedOut,
  });
});
