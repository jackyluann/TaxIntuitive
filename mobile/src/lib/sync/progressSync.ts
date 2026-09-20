import { supabase } from '@/lib/supabase/client';
import type {
  ActiveDayRow,
  LessonProgressRow,
  QuizAttemptRow,
  SimulatorRunRow,
  VideoProgressRow,
  XpEventRow,
} from '@/lib/supabase/database.types';
import { emptyProgress, type ProgressState } from '@/lib/xp/types';

/**
 * Cloud backup / cross-device sync for signed-in learners.
 *
 * Offline-first: local state is always authoritative for the current session. These helpers
 * mirror it upward and hydrate it on sign-in. Every function fails soft — a sync problem must
 * never block learning.
 */

export async function pullRemoteProgress(userId: string): Promise<ProgressState | null> {
  if (!supabase) return null;
  try {
    const [xp, lessons, attempts, videos, runs, days] = await Promise.all([
      supabase.from('xp_events').select('*').eq('user_id', userId),
      supabase.from('lesson_progress').select('*').eq('user_id', userId),
      supabase.from('quiz_attempts').select('*').eq('user_id', userId),
      supabase.from('video_progress').select('*').eq('user_id', userId),
      supabase.from('simulator_runs').select('*').eq('user_id', userId),
      supabase.from('active_days').select('*').eq('user_id', userId),
    ]);

    const state = emptyProgress();

    for (const e of (xp.data ?? []) as XpEventRow[]) {
      state.xpEvents.push({
        id: e.id,
        reason: e.reason as ProgressState['xpEvents'][number]['reason'],
        xp: e.xp,
        trackId: e.track_id as ProgressState['xpEvents'][number]['trackId'],
        refId: e.ref_id ?? undefined,
        at: e.created_at,
      });
    }
    for (const l of (lessons.data ?? []) as LessonProgressRow[]) {
      state.lessons[l.lesson_id] = {
        opened: l.opened,
        completed: l.completed,
        completedAt: l.completed_at ?? undefined,
        bookmarked: l.bookmarked,
        scrollProgress: l.scroll_progress,
        lastOpenedAt: l.last_opened_at,
      };
    }
    for (const a of (attempts.data ?? []) as QuizAttemptRow[]) {
      state.quizAttempts.push({
        id: a.id,
        quizId: a.quiz_id,
        score: a.score,
        total: a.total,
        at: a.created_at,
        wrongQuestionIds: Array.isArray(a.wrong_question_ids)
          ? (a.wrong_question_ids as string[])
          : [],
      });
    }
    for (const v of (videos.data ?? []) as VideoProgressRow[]) {
      state.videos[v.video_id] = {
        positionSeconds: v.position_seconds,
        completed: v.completed,
        lastWatchedAt: v.last_watched_at,
      };
    }
    for (const r of (runs.data ?? []) as SimulatorRunRow[]) {
      state.simulatorRuns.push({
        id: r.id,
        at: r.created_at,
        finalCash: r.final_cash,
        finalSavings: r.final_savings,
        finalDebt: r.final_debt,
        moneySmarts: r.money_smarts,
        maxMoneySmarts: r.max_money_smarts,
        tier: r.tier,
        lessons: Array.isArray(r.lessons) ? (r.lessons as string[]) : [],
      });
    }
    state.activeDates = ((days.data ?? []) as ActiveDayRow[]).map((d) => d.day);

    return state;
  } catch {
    return null;
  }
}

/**
 * Pushes the whole local state upward using upserts. Idempotent by design: xp_events is unique
 * on (user, reason, ref_id) and progress tables are keyed on (user, item).
 */
export async function pushProgress(userId: string, state: ProgressState): Promise<void> {
  if (!supabase) return;
  try {
    const xpRows = state.xpEvents.map((e) => ({
      user_id: userId,
      reason: e.reason,
      xp: e.xp,
      track_id: e.trackId,
      ref_id: e.refId ?? null,
      created_at: e.at,
    }));
    const lessonRows = Object.entries(state.lessons).map(([lesson_id, l]) => ({
      user_id: userId,
      lesson_id,
      opened: l.opened,
      completed: l.completed,
      completed_at: l.completedAt ?? null,
      bookmarked: l.bookmarked,
      scroll_progress: l.scrollProgress ?? 0,
      last_opened_at: l.lastOpenedAt ?? new Date().toISOString(),
    }));
    const videoRows = Object.entries(state.videos).map(([video_id, v]) => ({
      user_id: userId,
      video_id,
      position_seconds: v.positionSeconds,
      completed: v.completed,
      last_watched_at: v.lastWatchedAt ?? new Date().toISOString(),
    }));
    const dayRows = state.activeDates.map((day) => ({ user_id: userId, day }));

    await Promise.all([
      xpRows.length
        ? supabase.from('xp_events').upsert(xpRows, { onConflict: 'user_id,reason,ref_id' })
        : Promise.resolve(),
      lessonRows.length
        ? supabase.from('lesson_progress').upsert(lessonRows, { onConflict: 'user_id,lesson_id' })
        : Promise.resolve(),
      videoRows.length
        ? supabase.from('video_progress').upsert(videoRows, { onConflict: 'user_id,video_id' })
        : Promise.resolve(),
      dayRows.length
        ? supabase.from('active_days').upsert(dayRows, { onConflict: 'user_id,day' })
        : Promise.resolve(),
    ]);

    // Attempts and runs are append-only history; insert just the ones the server lacks.
    const [remoteAttempts, remoteRuns] = await Promise.all([
      supabase.from('quiz_attempts').select('created_at,quiz_id,score').eq('user_id', userId),
      supabase.from('simulator_runs').select('created_at').eq('user_id', userId),
    ]);
    const attemptKeys = new Set(
      ((remoteAttempts.data ?? []) as { created_at: string; quiz_id: string; score: number }[]).map(
        (a) => `${a.quiz_id}|${a.created_at}|${a.score}`,
      ),
    );
    const newAttempts = state.quizAttempts
      .filter((a) => !attemptKeys.has(`${a.quizId}|${a.at}|${a.score}`))
      .map((a) => ({
        user_id: userId,
        quiz_id: a.quizId,
        score: a.score,
        total: a.total,
        wrong_question_ids: a.wrongQuestionIds,
        created_at: a.at,
      }));
    if (newAttempts.length) await supabase.from('quiz_attempts').insert(newAttempts);

    const runTimes = new Set(
      ((remoteRuns.data ?? []) as { created_at: string }[]).map((r) => r.created_at),
    );
    const newRuns = state.simulatorRuns
      .filter((r) => !runTimes.has(r.at))
      .map((r) => ({
        user_id: userId,
        final_cash: r.finalCash,
        final_savings: r.finalSavings,
        final_debt: r.finalDebt,
        money_smarts: r.moneySmarts,
        max_money_smarts: r.maxMoneySmarts,
        tier: r.tier,
        lessons: r.lessons,
        created_at: r.at,
      }));
    if (newRuns.length) await supabase.from('simulator_runs').insert(newRuns);
  } catch {
    // Sync is best-effort; local state remains correct and the next commit retries.
  }
}
