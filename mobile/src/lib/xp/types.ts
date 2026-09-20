import type { XpReason, XpTrackId } from '@/content/types';

export interface XpEvent {
  id: string;
  reason: XpReason;
  xp: number;
  trackId: XpTrackId;
  /** Lesson/quiz/video/match id this award relates to. Used to keep awards idempotent. */
  refId?: string;
  /** ISO timestamp. */
  at: string;
}

export interface LessonProgress {
  opened: boolean;
  completed: boolean;
  completedAt?: string;
  bookmarked: boolean;
  /** 0-1, how far the learner scrolled. Lets "Continue learning" resume mid-lesson. */
  scrollProgress?: number;
  lastOpenedAt?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  total: number;
  /** ISO timestamp. */
  at: string;
  /** Question ids answered incorrectly — drives lesson recommendations. */
  wrongQuestionIds: string[];
}

export interface VideoProgress {
  positionSeconds: number;
  completed: boolean;
  lastWatchedAt?: string;
}

export type SimulatorTier = 'broke' | 'bronze' | 'silver' | 'gold';

export interface SimulatorRun {
  id: string;
  at: string;
  finalCash: number;
  finalSavings: number;
  finalDebt: number;
  moneySmarts: number;
  maxMoneySmarts: number;
  tier: SimulatorTier;
  lessons: string[];
}

export interface DuoRecord {
  wins: number;
  losses: number;
  ties: number;
}

/** Everything about one learner's progress. Identical shape locally and in Supabase. */
export interface ProgressState {
  xpEvents: XpEvent[];
  lessons: Record<string, LessonProgress>;
  quizAttempts: QuizAttempt[];
  videos: Record<string, VideoProgress>;
  simulatorRuns: SimulatorRun[];
  duo: DuoRecord;
  /** ISO dates (YYYY-MM-DD) on which the learner did something. Drives the streak. */
  activeDates: string[];
}

export const emptyProgress = (): ProgressState => ({
  xpEvents: [],
  lessons: {},
  quizAttempts: [],
  videos: {},
  simulatorRuns: [],
  duo: { wins: 0, losses: 0, ties: 0 },
  activeDates: [],
});
