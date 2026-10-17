import { AppIcon } from '@/components/AppIcon';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import type { QuizQuestion } from '@/content/types';
import {
  abandonMatch,
  advanceMatch,
  fetchAnswers,
  fetchMatch,
  fetchParticipants,
  setReady,
  submitAnswer,
  subscribeToMatch,
  touchPresence,
  type SubmitAnswerResult,
} from '@/lib/duo/client';
import type {
  DuoAnswerRow,
  DuoMatchRow,
  DuoParticipantRow,
} from '@/lib/supabase/database.types';
import {
  Button,
  Card,
  Pill,
  ProgressBar,
  StatTile,
  TIText,
} from '@/components/ui';
import { useContent } from '@/providers/content';
import { useAuth } from '@/providers/auth';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
/** Opponent is considered disconnected after this long without a heartbeat. */
const PRESENCE_TIMEOUT_MS = 20_000;

export default function DuoMatchScreen() {
  const t = useTheme();
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { content } = useContent();
  const { user } = useAuth();
  const { recordDuoResult } = useProgress();

  const [match, setMatch] = useState<DuoMatchRow | null>(null);
  const [participants, setParticipants] = useState<DuoParticipantRow[]>([]);
  const [answers, setAnswers] = useState<DuoAnswerRow[]>([]);
  const [loading, setLoading] = useState(true);
  /**
   * Local answer state, tagged with the question it belongs to. Keying it this way means the UI
   * resets itself when the server advances — derived, rather than synchronized by an effect.
   */
  const [answerState, setAnswerState] = useState<{
    index: number;
    chosen: number | null;
    result: SubmitAnswerResult | null;
  } | null>(null);
  // 0 until the first tick: calling Date.now() during render is impure.
  const [now, setNow] = useState(0);
  const resultRecorded = useRef(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reloadSequence = useRef(0);
  const submitting = useRef(false);
  const reloading = useRef(false);

  const reload = useCallback(async () => {
    if (!matchId || reloading.current) return;
    reloading.current = true;
    const sequence = reloadSequence.current;
    try {
      const [m, p, a] = await Promise.all([
        fetchMatch(matchId),
        fetchParticipants(matchId),
        fetchAnswers(matchId),
      ]);
      if (sequence !== reloadSequence.current) return;
      setMatch(m);
      setParticipants(p);
      setAnswers(a);
      setConnectionError(null);
    } catch {
      if (sequence === reloadSequence.current)
        setConnectionError('Connection interrupted. Retrying automatically…');
    } finally {
      reloading.current = false;
      if (sequence === reloadSequence.current) setLoading(false);
    }
  }, [matchId]);

  // Realtime reduces latency; polling recovers missed events and resumed connections.
  useEffect(() => {
    if (!matchId) return;
    // reload only updates state after the network awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
    const { unsubscribe } = subscribeToMatch(matchId, () => void reload());
    const poll = setInterval(() => void reload(), 3000);
    return () => {
      clearInterval(poll);
      unsubscribe();
      reloadSequence.current += 1;
    };
  }, [matchId, reload]);

  // Ticking clock drives the countdown and the presence indicator.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  // Heartbeat.
  useEffect(() => {
    if (!matchId || !user) return;
    void touchPresence(matchId, user.id);
    const id = setInterval(() => void touchPresence(matchId, user.id), 8000);
    return () => clearInterval(id);
  }, [matchId, user]);

  const me = participants.find((p) => p.user_id === user?.id) ?? null;
  const opponent = participants.find((p) => p.user_id !== user?.id) ?? null;

  const questionIds = useMemo(
    () =>
      match && Array.isArray(match.question_ids)
        ? (match.question_ids as string[])
        : [],
    [match],
  );
  const currentIndex = match?.current_index ?? 0;
  // Only honour local answer state if it belongs to the question on screen right now.
  const chosen =
    answerState?.index === currentIndex ? answerState.chosen : null;
  const result =
    answerState?.index === currentIndex ? (answerState.result ?? null) : null;
  const question: QuizQuestion | undefined = useMemo(() => {
    const id = questionIds[currentIndex];
    return content.questions.find((q) => q.id === id);
  }, [content.questions, questionIds, currentIndex]);

  // Reset per-question local state whenever the server advances.
  /** Seconds left on the current question, derived from the server's question start time. */
  const remaining = useMemo(() => {
    if (now === 0 || match?.status !== 'active' || !match.question_started_at)
      return 0;
    const started = new Date(match.question_started_at).getTime();
    const left = Math.max(
      0,
      match.seconds_per_question * 1000 - (now - started),
    );
    return Math.ceil(left / 1000);
  }, [now, match]);

  // The server owns expiry. Keep retrying even after we answered or the opponent left.
  // Include the expected index so late/duplicate requests cannot advance a later round.
  useEffect(() => {
    if (!matchId || match?.status !== 'active') return;
    let inFlight = false;
    let disposed = false;
    const tick = async () => {
      if (inFlight || disposed) return;
      inFlight = true;
      try {
        await advanceMatch(matchId, currentIndex);
        if (!disposed) await reload();
      } catch {
        /* polling will retry; keep the last usable match on screen */
      } finally {
        inFlight = false;
      }
    };
    const timer = setInterval(() => void tick(), 2000);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [matchId, match?.status, currentIndex, reload]);

  // Record the outcome once, for XP and the win/loss record.
  useEffect(() => {
    if (
      match?.status !== 'finished' ||
      !user ||
      resultRecorded.current ||
      !matchId
    )
      return;
    resultRecorded.current = true;
    const outcome = match.is_tie
      ? 'tie'
      : match.winner_id === user.id
        ? 'win'
        : 'loss';
    void recordDuoResult({ matchId, outcome });
    void Haptics.notificationAsync(
      outcome === 'win'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});
  }, [match, user, matchId, recordDuoResult]);

  const choose = async (index: number) => {
    if (chosen !== null || !matchId || submitting.current) return;
    submitting.current = true;
    setAnswerState({ index: currentIndex, chosen: index, result: null });
    try {
      const res = await submitAnswer(matchId, currentIndex, index);
      setAnswerState({ index: currentIndex, chosen: index, result: res });
      void Haptics.notificationAsync(
        res.isCorrect
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning,
      ).catch(() => {});
      await advanceMatch(matchId, currentIndex).catch(() => {});
      await reload();
    } catch (e) {
      await reload();
      setAnswerState((state) => (state?.index === currentIndex ? null : state));
      Alert.alert(
        'Could not confirm answer',
        e instanceof Error ? e.message : 'Please retry.',
      );
    } finally {
      submitting.current = false;
    }
  };

  const leave = () => {
    Alert.alert(
      match?.status === 'active' ? 'Forfeit match?' : 'Leave match?',
      match?.status === 'active'
        ? 'Leaving now gives your opponent the win.'
        : 'This closes the room.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            if (matchId) await abandonMatch(matchId).catch(() => {});
            router.replace('/duo');
          },
        },
      ],
    );
  };

  /* ------------------------------------------------------------------- loading */
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: t.colors.bg,
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={t.colors.brand} />
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }}>
        <View style={{ padding: t.space.lg, gap: t.space.md }}>
          <TIText variant="h3">
            {connectionError ? 'Reconnecting…' : 'Match not found'}
          </TIText>
          <TIText variant="small" tone="muted">
            {connectionError ?? 'The room may have expired or been closed.'}
          </TIText>
          <Button
            label="Back to Quiz Duo"
            onPress={() => router.replace('/duo')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const opponentOnline = opponent
    ? now - new Date(opponent.last_seen_at).getTime() < PRESENCE_TIMEOUT_MS
    : false;

  /* ------------------------------------------------------------------- finished */
  if (match.status === 'finished' || match.status === 'abandoned') {
    const iWon = match.winner_id === user?.id;
    const title =
      match.status === 'abandoned'
        ? 'Match closed'
        : match.is_tie
          ? "It's a tie!"
          : iWon
            ? 'You win!'
            : 'You lost this one';
    const myAnswers = answers.filter((a) => a.user_id === user?.id);
    const correct = myAnswers.filter((a) => a.is_correct).length;

    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: t.colors.bg }}
        edges={['left', 'right']}
      >
        <ScrollView
          contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg }}
        >
          <Card style={{ alignItems: 'center', gap: t.space.sm }}>
            <AppIcon
              size={52}
              name={
                match.status === 'abandoned'
                  ? 'exit-outline'
                  : match.is_tie
                    ? 'people-outline'
                    : iWon
                      ? 'trophy-outline'
                      : 'fitness-outline'
              }
            />
            <TIText variant="h1" center>
              {title}
            </TIText>
            <TIText variant="small" tone="muted" center>
              {match.status === 'abandoned'
                ? 'This room was closed before the match finished.'
                : `You answered ${correct} of ${myAnswers.length} correctly.`}
            </TIText>
          </Card>

          <View style={{ flexDirection: 'row', gap: t.space.md }}>
            <StatTile
              label={me?.display_name ?? 'You'}
              value={`${me?.score ?? 0}`}
            />
            <StatTile
              label={opponent?.display_name ?? 'Opponent'}
              value={`${opponent?.score ?? 0}`}
              tone="ink"
            />
          </View>
          {myAnswers.length ? (
            <View style={{ flexDirection: 'row', gap: t.space.md }}>
              <StatTile
                label="Accuracy"
                value={`${Math.round((correct / Math.max(1, myAnswers.length)) * 100)}%`}
                tone="accent"
              />
              <StatTile
                label="XP earned"
                value={iWon ? '+30' : '+5'}
                tone="brand"
              />
            </View>
          ) : null}

          {answers.length ? (
            <Card style={{ gap: t.space.md }}>
              <Text style={{ ...t.type.overline, color: t.colors.muted }}>
                ANSWER REVIEW
              </Text>
              {questionIds.map((qid, i) => {
                const q = content.questions.find((x) => x.id === qid);
                if (!q) return null;
                const mine = answers.find(
                  (a) => a.user_id === user?.id && a.question_index === i,
                );
                if (!mine) return null;
                return (
                  <View key={qid} style={{ gap: 3 }}>
                    <TIText variant="bodyStrong">
                      {i + 1}. {q.prompt}
                    </TIText>
                    <TIText
                      variant="small"
                      tone={mine.is_correct ? 'success' : 'danger'}
                    >
                      {mine.is_correct
                        ? `✓ +${mine.awarded_points} pts`
                        : mine.chosen_index === null
                          ? '✕ Ran out of time'
                          : `✕ You chose ${LETTERS[mine.chosen_index]}`}
                    </TIText>
                    <TIText variant="caption" tone="muted">
                      Answer: {LETTERS[q.answerIndex]}){' '}
                      {q.options[q.answerIndex]} — {q.explanation}
                    </TIText>
                  </View>
                );
              })}
            </Card>
          ) : null}

          <View style={{ gap: t.space.sm }}>
            <Button
              label="Rematch"
              variant="accent"
              onPress={() => router.replace('/duo')}
              fullWidth
            />
            <Button
              label="Back to quizzes"
              variant="outline"
              onPress={() => router.replace('/quizzes')}
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* --------------------------------------------------------------- waiting room */
  if (match.status === 'waiting' || match.status === 'ready') {
    const bothHere = participants.length === 2;
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: t.colors.bg }}
        edges={['left', 'right']}
      >
        <ScrollView
          contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg }}
        >
          <Card style={{ alignItems: 'center', gap: t.space.md }}>
            <TIText variant="overline" tone="muted">
              ROOM CODE
            </TIText>
            <Text
              style={{
                fontSize: 38,
                fontWeight: '800',
                letterSpacing: 6,
                color: t.colors.brandDark,
              }}
            >
              {match.room_code}
            </Text>
            <View style={{ flexDirection: 'row', gap: t.space.sm }}>
              <Button
                label="Copy"
                variant="ghost"
                onPress={() => void Clipboard.setStringAsync(match.room_code)}
              />
              <Button
                label="Invite a friend"
                variant="ghost"
                onPress={() =>
                  void Share.share({
                    message: `Play Quiz Duo with me on TaxIntuitive! Room code: ${match.room_code}`,
                  })
                }
              />
            </View>
          </Card>

          <Card style={{ gap: t.space.md }}>
            <Text style={{ ...t.type.overline, color: t.colors.muted }}>
              PLAYERS
            </Text>
            {participants.map((p) => (
              <View
                key={p.user_id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.space.sm,
                }}
              >
                <AppIcon
                  size={18}
                  name={
                    p.role === 'host'
                      ? 'ribbon-outline'
                      : 'game-controller-outline'
                  }
                />
                <TIText variant="bodyStrong" style={{ flex: 1 }}>
                  {p.display_name}
                  {p.user_id === user?.id ? ' (you)' : ''}
                </TIText>
                {p.ready ? (
                  <Pill label="Ready" tone="success" />
                ) : (
                  <Pill label="Waiting" tone="muted" />
                )}
              </View>
            ))}
            {!bothHere ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.space.sm,
                }}
              >
                <ActivityIndicator color={t.colors.brand} />
                <TIText variant="small" tone="muted">
                  Waiting for an opponent to join…
                </TIText>
              </View>
            ) : null}
          </Card>

          <Button
            label={me?.ready ? 'Waiting for the other player…' : "I'm ready"}
            onPress={() =>
              matchId &&
              void setReady(matchId)
                .then(() => reload())
                .catch((e) =>
                  Alert.alert(
                    'Could not set ready',
                    e instanceof Error ? e.message : 'Unknown error',
                  ),
                )
            }
            disabled={!bothHere || Boolean(me?.ready)}
            fullWidth
          />
          <Button
            label="Leave room"
            variant="outline"
            onPress={leave}
            fullWidth
          />
          <TIText variant="caption" tone="muted" center>
            Both players get the same questions and the same time limit.
          </TIText>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------------------------- playing */
  const myAnswerThisRound = answers.find(
    (a) => a.user_id === user?.id && a.question_index === currentIndex,
  );
  const opponentAnswered = answers.some(
    (a) => a.user_id === opponent?.user_id && a.question_index === currentIndex,
  );
  const revealed = Boolean(result || myAnswerThisRound);
  const correctIndex = result?.correctIndex ?? question?.answerIndex ?? -1;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.colors.bg }}
      edges={['left', 'right']}
    >
      <ScrollView
        contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg }}
      >
        {/* scoreboard */}
        <View style={{ flexDirection: 'row', gap: t.space.md }}>
          <StatTile
            label={`${me?.display_name ?? 'You'}`}
            value={`${me?.score ?? 0}`}
          />
          <StatTile
            label={`${opponent?.display_name ?? 'Opponent'}${opponentOnline ? '' : ' (offline)'}`}
            value={`${opponent?.score ?? 0}`}
            tone="ink"
          />
        </View>
        {!opponentOnline && opponent ? (
          <TIText variant="caption" tone="danger" center>
            Your opponent may have lost connection…
          </TIText>
        ) : null}

        <View style={{ gap: 6 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <TIText variant="caption" tone="muted">
              Question {currentIndex + 1} of {questionIds.length}
            </TIText>
            <TIText
              variant="caption"
              tone={remaining <= 5 ? 'danger' : 'muted'}
            >
              {remaining}s
            </TIText>
          </View>
          <ProgressBar
            value={remaining / Math.max(1, match.seconds_per_question)}
            color={remaining <= 5 ? t.colors.danger : t.colors.brand}
          />
        </View>

        {!question ? (
          <Card>
            <TIText variant="small" tone="muted">
              Loading question…
            </TIText>
          </Card>
        ) : (
          <>
            <>
              {connectionError ? (
                <TIText variant="small" tone="danger">
                  {connectionError}
                </TIText>
              ) : null}
            </>
            <TIText variant="h2">{question.prompt}</TIText>
            <View style={{ gap: t.space.sm }}>
              {question.options.map((option, i) => {
                const isChosen =
                  chosen === i || myAnswerThisRound?.chosen_index === i;
                const isAnswer = revealed && i === correctIndex;
                const bg = revealed
                  ? isAnswer
                    ? t.colors.successBg
                    : isChosen
                      ? t.colors.dangerBg
                      : t.colors.card
                  : t.colors.card;
                const border = revealed
                  ? isAnswer
                    ? t.colors.success
                    : isChosen
                      ? t.colors.danger
                      : t.colors.line
                  : t.colors.line;
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: revealed || chosen !== null,
                    }}
                    disabled={revealed || chosen !== null}
                    onPress={() => void choose(i)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: t.space.md,
                      backgroundColor: bg,
                      borderWidth: 1.5,
                      borderColor: border,
                      borderRadius: t.radius.lg,
                      padding: t.space.lg,
                      minHeight: 56,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 9,
                        backgroundColor: t.colors.tipBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{ fontWeight: '800', color: t.colors.brandDark }}
                      >
                        {LETTERS[i]}
                      </Text>
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        lineHeight: 22,
                        color: t.colors.ink,
                      }}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {result ? (
          <Card
            style={{
              backgroundColor: result.isCorrect
                ? t.colors.successBg
                : t.colors.dangerBg,
              borderColor: result.isCorrect
                ? t.colors.success
                : t.colors.danger,
              gap: 4,
            }}
          >
            <TIText
              variant="bodyStrong"
              tone={result.isCorrect ? 'success' : 'danger'}
            >
              {result.timedOut
                ? 'Out of time'
                : result.isCorrect
                  ? `✓ Correct · +${result.awardedPoints} pts`
                  : '✕ Not quite'}
            </TIText>
            <TIText variant="small">{result.explanation}</TIText>
          </Card>
        ) : null}

        {revealed ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space.sm,
              justifyContent: 'center',
            }}
          >
            {opponentAnswered ? (
              <TIText variant="caption" tone="muted">
                Both answered — next question coming up…
              </TIText>
            ) : (
              <>
                <ActivityIndicator color={t.colors.brand} />
                <TIText variant="caption" tone="muted">
                  Waiting for {opponent?.display_name ?? 'your opponent'}…
                </TIText>
              </>
            )}
          </View>
        ) : null}

        <Button
          label="Forfeit match"
          variant="outline"
          onPress={leave}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}
