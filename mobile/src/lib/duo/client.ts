import type { RealtimeChannel } from '@supabase/supabase-js';
import { requireSupabase } from '@/lib/supabase/client';
import type { DuoAnswerRow, DuoMatchRow, DuoParticipantRow } from '@/lib/supabase/database.types';

export interface CreateMatchResult {
  matchId: string;
  roomCode: string;
  questionCount: number;
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  awardedPoints: number;
  timedOut: boolean;
}

async function invoke<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke(name, { body: body ?? {} });
  if (error) {
    // Edge Functions return {error} in the body for handled failures; surface that text.
    const detail =
      (data as { error?: string } | null)?.error ?? error.message ?? 'Something went wrong';
    throw new Error(detail);
  }
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(String((data as { error: string }).error));
  }
  return data as T;
}

export const createMatch = (displayName?: string) =>
  invoke<CreateMatchResult>('duo-create-match', { displayName });

export const joinMatch = (roomCode: string, displayName?: string) =>
  invoke<{ matchId: string; roomCode: string; rejoined: boolean }>('duo-join-match', {
    roomCode,
    displayName,
  });

export const setReady = (matchId: string) =>
  invoke<{ ready: boolean; started: boolean }>('duo-ready', { matchId });

export const submitAnswer = (matchId: string, questionIndex: number, chosenIndex: number | null) =>
  invoke<SubmitAnswerResult>('duo-submit-answer', { matchId, questionIndex, chosenIndex });

export const advanceMatch = (matchId: string) =>
  invoke<{ advanced: boolean; finished?: boolean; currentIndex?: number }>('duo-advance', {
    matchId,
  });

export const abandonMatch = (matchId: string) =>
  invoke<{ status: string; winnerId?: string }>('duo-abandon', { matchId });

/* ------------------------------------------------------------------------- reads */

export async function fetchMatch(matchId: string): Promise<DuoMatchRow | null> {
  const client = requireSupabase();
  const { data } = await client.from('duo_matches').select('*').eq('id', matchId).maybeSingle();
  return (data as DuoMatchRow | null) ?? null;
}

export async function fetchParticipants(matchId: string): Promise<DuoParticipantRow[]> {
  const client = requireSupabase();
  const { data } = await client.from('duo_participants').select('*').eq('match_id', matchId);
  return ((data ?? []) as DuoParticipantRow[]).sort((a, b) => a.role.localeCompare(b.role));
}

export async function fetchAnswers(matchId: string): Promise<DuoAnswerRow[]> {
  const client = requireSupabase();
  const { data } = await client
    .from('duo_answers')
    .select('*')
    .eq('match_id', matchId)
    .order('question_index');
  return (data ?? []) as DuoAnswerRow[];
}

/** Heartbeat so the opponent's UI can show "connection lost". */
export async function touchPresence(matchId: string, userId: string) {
  const client = requireSupabase();
  await client
    .from('duo_participants')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('match_id', matchId)
    .eq('user_id', userId);
}

/**
 * Subscribes to everything that can change during a match. Returns an unsubscribe function.
 * Realtime is a notification channel only — state is always re-read from the tables, so a
 * dropped event can never corrupt the match view.
 */
export function subscribeToMatch(
  matchId: string,
  onChange: () => void,
): { channel: RealtimeChannel; unsubscribe: () => void } {
  const client = requireSupabase();
  const channel = client
    .channel(`duo:${matchId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'duo_matches', filter: `id=eq.${matchId}` },
      onChange,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'duo_participants',
        filter: `match_id=eq.${matchId}`,
      },
      onChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'duo_answers', filter: `match_id=eq.${matchId}` },
      onChange,
    )
    .subscribe();

  return {
    channel,
    unsubscribe: () => {
      void client.removeChannel(channel);
    },
  };
}
