import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { XpReason, XpTrackId } from '@/content/types';
import {
  alreadyAwarded,
  deriveStats,
  PASS_RATIO,
  trackForCategory,
  type DerivedStats,
} from '@/lib/xp/engine';
import { evaluateAchievements, type EvaluatedAchievement } from '@/lib/xp/achievements';
import {
  emptyProgress,
  type ProgressState,
  type QuizAttempt,
  type SimulatorRun,
  type XpEvent,
} from '@/lib/xp/types';
import { readJson, writeJson, StorageKeys, remove } from '@/lib/storage/local';
import { useAuth } from './auth';
import { useContent } from './content';
import { pullRemoteProgress, pushProgress } from '@/lib/sync/progressSync';

/** XP amounts for repeatable/awarded actions that aren't defined by content. */
export const XP_RULES = {
  lessonOpened: 2,
  quizImprovedBonus: 5,
  quizPerfectBonus: 10,
  simulatorCompleted: 50,
  duoWin: 25,
  duoPlayed: 5,
  streakDay: 5,
} as const;

export interface ProgressApi {
  progress: ProgressState;
  stats: DerivedStats;
  achievements: EvaluatedAchievement[];
  loading: boolean;
  syncing: boolean;
  /** Lesson the learner was last reading and hasn't finished, for "Continue learning". */
  continueLessonId: string | null;

  openLesson(lessonId: string): Promise<void>;
  setLessonScroll(lessonId: string, progress: number): void;
  completeLesson(lessonId: string): Promise<void>;
  toggleBookmark(lessonId: string): Promise<void>;
  recordQuizAttempt(input: {
    quizId: string;
    score: number;
    total: number;
    wrongQuestionIds: string[];
  }): Promise<{ xpAwarded: number; passed: boolean; improved: boolean }>;
  setVideoPosition(videoId: string, seconds: number): void;
  completeVideo(videoId: string): Promise<void>;
  recordSimulatorRun(run: Omit<SimulatorRun, 'id' | 'at'>): Promise<void>;
  recordDuoResult(input: { matchId: string; outcome: 'win' | 'loss' | 'tie' }): Promise<void>;
  resetProgress(): Promise<void>;
  /** Copies on-device guest progress into the signed-in account. */
  mergeGuestIntoAccount(): Promise<void>;
  hasGuestDataToMerge: boolean;
}

const ProgressContext = createContext<ProgressApi | null>(null);

const todayIso = () => new Date().toISOString().slice(0, 10);
const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { content } = useContent();
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(emptyProgress);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [hasGuestDataToMerge, setHasGuestDataToMerge] = useState(false);
  /** Guest snapshot kept aside when a user signs in, so it can still be merged. */
  const guestSnapshot = useRef<ProgressState | null>(null);

  // Load local progress on boot.
  useEffect(() => {
    let active = true;
    readJson<ProgressState>(StorageKeys.progress).then((stored) => {
      if (!active) return;
      if (stored) setProgress({ ...emptyProgress(), ...stored });
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist every change locally. This is the source of truth for guests, and a cache for
  // signed-in users so the app still works offline.
  useEffect(() => {
    if (loading) return;
    void writeJson(StorageKeys.progress, progress);
  }, [progress, loading]);

  // On sign-in: pull cloud progress, and remember any local guest data for merging.
  useEffect(() => {
    if (!user || loading) return;
    let active = true;

    (async () => {
      setSyncing(true);
      const localHadData =
        progress.xpEvents.length > 0 ||
        Object.keys(progress.lessons).length > 0 ||
        progress.quizAttempts.length > 0;
      if (localHadData) guestSnapshot.current = progress;

      const remote = await pullRemoteProgress(user.id);
      if (!active) return;

      if (remote) {
        setProgress(remote);
        const merged = await readJson<boolean>(StorageKeys.mergeOffered);
        setHasGuestDataToMerge(Boolean(localHadData) && merged !== true);
      }
      setSyncing(false);
    })();

    return () => {
      active = false;
    };
    // Intentionally keyed on user id only: this runs once per sign-in, not on every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  /** Applies a local update and, when signed in, mirrors it to Supabase. */
  const commit = useCallback(
    async (updater: (prev: ProgressState) => ProgressState) => {
      let next!: ProgressState;
      setProgress((prev) => {
        next = updater(prev);
        return next;
      });
      if (user) {
        // Fire and forget: a failed push is retried on the next commit, and local state stands.
        void pushProgress(user.id, next);
      }
    },
    [user],
  );

  /** Adds an XP event unless this exact award already exists. Also marks today active. */
  const award = useCallback(
    (
      prev: ProgressState,
      reason: XpReason,
      xp: number,
      trackId: XpTrackId,
      refId?: string,
    ): { state: ProgressState; awarded: number } => {
      const day = todayIso();
      const activeDates = prev.activeDates.includes(day)
        ? prev.activeDates
        : [...prev.activeDates, day];

      if (xp <= 0 || alreadyAwarded(prev.xpEvents, reason, refId)) {
        return { state: { ...prev, activeDates }, awarded: 0 };
      }
      const event: XpEvent = {
        id: newId(),
        reason,
        xp,
        trackId,
        refId,
        at: new Date().toISOString(),
      };
      return { state: { ...prev, activeDates, xpEvents: [...prev.xpEvents, event] }, awarded: xp };
    },
    [],
  );

  const lessonTrack = useCallback(
    (lessonId: string): XpTrackId => {
      const lesson = content.lessons.find((l) => l.id === lessonId);
      return lesson ? trackForCategory(content, lesson.categoryId) : 'taxes';
    },
    [content],
  );

  const openLesson = useCallback(
    async (lessonId: string) => {
      await commit((prev) => {
        const existing = prev.lessons[lessonId];
        const { state } = award(
          prev,
          'lesson_opened',
          XP_RULES.lessonOpened,
          lessonTrack(lessonId),
          lessonId,
        );
        return {
          ...state,
          lessons: {
            ...state.lessons,
            [lessonId]: {
              opened: true,
              completed: existing?.completed ?? false,
              completedAt: existing?.completedAt,
              bookmarked: existing?.bookmarked ?? false,
              scrollProgress: existing?.scrollProgress ?? 0,
              lastOpenedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [award, commit, lessonTrack],
  );

  const setLessonScroll = useCallback((lessonId: string, value: number) => {
    // Local-only and unthrottled by design: it's cheap, and sync happens on real milestones.
    setProgress((prev) => {
      const existing = prev.lessons[lessonId];
      if (!existing) return prev;
      const clamped = Math.max(0, Math.min(1, value));
      if (Math.abs((existing.scrollProgress ?? 0) - clamped) < 0.05) return prev;
      return {
        ...prev,
        lessons: { ...prev.lessons, [lessonId]: { ...existing, scrollProgress: clamped } },
      };
    });
  }, []);

  const completeLesson = useCallback(
    async (lessonId: string) => {
      const lesson = content.lessons.find((l) => l.id === lessonId);
      await commit((prev) => {
        const { state } = award(
          prev,
          'lesson_completed',
          lesson?.xp ?? 10,
          lessonTrack(lessonId),
          lessonId,
        );
        const existing = state.lessons[lessonId];
        return {
          ...state,
          lessons: {
            ...state.lessons,
            [lessonId]: {
              opened: true,
              bookmarked: existing?.bookmarked ?? false,
              scrollProgress: 1,
              lastOpenedAt: existing?.lastOpenedAt,
              completed: true,
              completedAt: existing?.completedAt ?? new Date().toISOString(),
            },
          },
        };
      });
    },
    [award, commit, content.lessons, lessonTrack],
  );

  const toggleBookmark = useCallback(
    async (lessonId: string) => {
      await commit((prev) => {
        const existing = prev.lessons[lessonId];
        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [lessonId]: {
              opened: existing?.opened ?? true,
              completed: existing?.completed ?? false,
              completedAt: existing?.completedAt,
              scrollProgress: existing?.scrollProgress ?? 0,
              lastOpenedAt: existing?.lastOpenedAt,
              bookmarked: !(existing?.bookmarked ?? false),
            },
          },
        };
      });
    },
    [commit],
  );

  const recordQuizAttempt = useCallback<ProgressApi['recordQuizAttempt']>(
    async ({ quizId, score, total, wrongQuestionIds }) => {
      const quiz = content.quizzes.find((q) => q.id === quizId);
      const track: XpTrackId = quiz?.categoryId
        ? trackForCategory(content, quiz.categoryId)
        : 'taxes';
      const passed = total > 0 && score / total >= PASS_RATIO;

      const previousBest = Math.max(
        0,
        ...progress.quizAttempts.filter((a) => a.quizId === quizId).map((a) => a.score),
      );
      const improved = score > previousBest;
      let xpAwarded = 0;

      await commit((prev) => {
        const attempt: QuizAttempt = {
          id: newId(),
          quizId,
          score,
          total,
          at: new Date().toISOString(),
          wrongQuestionIds,
        };
        let state: ProgressState = { ...prev, quizAttempts: [...prev.quizAttempts, attempt] };

        if (passed) {
          const perCorrect = quiz?.xpPerCorrect ?? 4;
          const res = award(state, 'quiz_passed', score * perCorrect, track, quizId);
          state = res.state;
          xpAwarded += res.awarded;
        }
        if (improved && previousBest > 0) {
          const res = award(
            state,
            'quiz_improved',
            XP_RULES.quizImprovedBonus,
            track,
            `${quizId}:${score}`,
          );
          state = res.state;
          xpAwarded += res.awarded;
        }
        if (total > 0 && score === total) {
          const res = award(state, 'quiz_perfect', XP_RULES.quizPerfectBonus, track, quizId);
          state = res.state;
          xpAwarded += res.awarded;
        }
        const streak = award(state, 'streak_day', XP_RULES.streakDay, track, todayIso());
        state = streak.state;
        xpAwarded += streak.awarded;

        return state;
      });

      return { xpAwarded, passed, improved };
    },
    [award, commit, content, progress.quizAttempts],
  );

  const setVideoPosition = useCallback((videoId: string, seconds: number) => {
    setProgress((prev) => {
      const existing = prev.videos[videoId];
      if (existing && Math.abs(existing.positionSeconds - seconds) < 5) return prev;
      return {
        ...prev,
        videos: {
          ...prev.videos,
          [videoId]: {
            positionSeconds: Math.max(0, Math.round(seconds)),
            completed: existing?.completed ?? false,
            lastWatchedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const completeVideo = useCallback(
    async (videoId: string) => {
      const video = content.videos.find((v) => v.id === videoId);
      const lesson = content.lessons.find((l) => l.id === video?.relatedLessonId);
      const track: XpTrackId = lesson ? trackForCategory(content, lesson.categoryId) : 'taxes';
      await commit((prev) => {
        const { state } = award(prev, 'video_watched', video?.xp ?? 10, track, videoId);
        const existing = state.videos[videoId];
        return {
          ...state,
          videos: {
            ...state.videos,
            [videoId]: {
              positionSeconds: existing?.positionSeconds ?? 0,
              completed: true,
              lastWatchedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [award, commit, content],
  );

  const recordSimulatorRun = useCallback(
    async (run: Omit<SimulatorRun, 'id' | 'at'>) => {
      await commit((prev) => {
        const record: SimulatorRun = { ...run, id: newId(), at: new Date().toISOString() };
        // Awarded once overall; replaying is encouraged but shouldn't farm XP.
        const { state } = award(
          prev,
          'simulator_completed',
          XP_RULES.simulatorCompleted,
          'saving',
          'first-run',
        );
        return { ...state, simulatorRuns: [...state.simulatorRuns, record] };
      });
    },
    [award, commit],
  );

  const recordDuoResult = useCallback<ProgressApi['recordDuoResult']>(
    async ({ matchId, outcome }) => {
      await commit((prev) => {
        let state = prev;
        const played = award(state, 'duo_played', XP_RULES.duoPlayed, 'taxes', matchId);
        state = played.state;
        if (outcome === 'win') {
          state = award(state, 'duo_win', XP_RULES.duoWin, 'taxes', matchId).state;
        }
        return {
          ...state,
          duo: {
            wins: state.duo.wins + (outcome === 'win' ? 1 : 0),
            losses: state.duo.losses + (outcome === 'loss' ? 1 : 0),
            ties: state.duo.ties + (outcome === 'tie' ? 1 : 0),
          },
        };
      });
    },
    [award, commit],
  );

  const resetProgress = useCallback(async () => {
    setProgress(emptyProgress());
    await remove(StorageKeys.progress);
  }, []);

  const mergeGuestIntoAccount = useCallback(async () => {
    const snapshot = guestSnapshot.current;
    setHasGuestDataToMerge(false);
    await writeJson(StorageKeys.mergeOffered, true);
    if (!snapshot || !user) return;

    await commit((prev) => mergeProgress(prev, snapshot));
  }, [commit, user]);

  const stats = useMemo(() => deriveStats(progress, content), [progress, content]);
  const achievements = useMemo(() => evaluateAchievements(stats, content), [stats, content]);

  const continueLessonId = useMemo(() => {
    const started = Object.entries(progress.lessons)
      .filter(([, p]) => p.opened && !p.completed)
      .sort(
        ([, a], [, b]) =>
          new Date(b.lastOpenedAt ?? 0).getTime() - new Date(a.lastOpenedAt ?? 0).getTime(),
      );
    return started[0]?.[0] ?? null;
  }, [progress.lessons]);

  const value = useMemo<ProgressApi>(
    () => ({
      progress,
      stats,
      achievements,
      loading,
      syncing,
      continueLessonId,
      openLesson,
      setLessonScroll,
      completeLesson,
      toggleBookmark,
      recordQuizAttempt,
      setVideoPosition,
      completeVideo,
      recordSimulatorRun,
      recordDuoResult,
      resetProgress,
      mergeGuestIntoAccount,
      hasGuestDataToMerge,
    }),
    [
      progress,
      stats,
      achievements,
      loading,
      syncing,
      continueLessonId,
      openLesson,
      setLessonScroll,
      completeLesson,
      toggleBookmark,
      recordQuizAttempt,
      setVideoPosition,
      completeVideo,
      recordSimulatorRun,
      recordDuoResult,
      resetProgress,
      mergeGuestIntoAccount,
      hasGuestDataToMerge,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

/**
 * Union-merges guest progress into account progress. Deliberately conservative:
 * completions and bookmarks win, XP events dedupe on (reason, refId), and attempts are
 * concatenated so history isn't lost.
 */
export function mergeProgress(account: ProgressState, guest: ProgressState): ProgressState {
  const seen = new Set(account.xpEvents.map((e) => `${e.reason}|${e.refId ?? ''}`));
  const xpEvents = [...account.xpEvents];
  for (const e of guest.xpEvents) {
    const key = `${e.reason}|${e.refId ?? ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      xpEvents.push(e);
    }
  }

  const lessons = { ...account.lessons };
  for (const [id, g] of Object.entries(guest.lessons)) {
    const a = lessons[id];
    lessons[id] = a
      ? {
          opened: a.opened || g.opened,
          completed: a.completed || g.completed,
          completedAt: a.completedAt ?? g.completedAt,
          bookmarked: a.bookmarked || g.bookmarked,
          scrollProgress: Math.max(a.scrollProgress ?? 0, g.scrollProgress ?? 0),
          lastOpenedAt:
            new Date(a.lastOpenedAt ?? 0) > new Date(g.lastOpenedAt ?? 0)
              ? a.lastOpenedAt
              : g.lastOpenedAt,
        }
      : g;
  }

  const videos = { ...account.videos };
  for (const [id, g] of Object.entries(guest.videos)) {
    const a = videos[id];
    videos[id] = a
      ? {
          positionSeconds: Math.max(a.positionSeconds, g.positionSeconds),
          completed: a.completed || g.completed,
          lastWatchedAt: a.lastWatchedAt ?? g.lastWatchedAt,
        }
      : g;
  }

  const attemptKey = (a: QuizAttempt) => `${a.quizId}|${a.at}|${a.score}`;
  const attemptSeen = new Set(account.quizAttempts.map(attemptKey));
  const quizAttempts = [...account.quizAttempts];
  for (const g of guest.quizAttempts) {
    if (!attemptSeen.has(attemptKey(g))) quizAttempts.push(g);
  }

  const runSeen = new Set(account.simulatorRuns.map((r) => r.at));
  const simulatorRuns = [...account.simulatorRuns];
  for (const g of guest.simulatorRuns) if (!runSeen.has(g.at)) simulatorRuns.push(g);

  return {
    xpEvents,
    lessons,
    videos,
    quizAttempts,
    simulatorRuns,
    duo: {
      wins: account.duo.wins + guest.duo.wins,
      losses: account.duo.losses + guest.duo.losses,
      ties: account.duo.ties + guest.duo.ties,
    },
    activeDates: Array.from(new Set([...account.activeDates, ...guest.activeDates])).sort(),
  };
}

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
