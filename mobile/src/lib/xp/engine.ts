import type { ContentBundle, LessonCategoryId, XpTrackId } from '@/content/types';
import type { ProgressState, XpEvent, SimulatorTier } from './types';

export interface TrackStats {
  trackId: XpTrackId;
  xp: number;
  /** XP available in this track across all content. */
  available: number;
  /** 0-1 */
  ratio: number;
}

export interface DerivedStats {
  totalXp: number;
  level: number;
  levelTitle: string;
  /** XP into the current level, and what the next level needs. null when maxed. */
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  /** 0-100, derived from real activity against all available content. Never hard-coded. */
  literacyScore: number;
  tracks: TrackStats[];
  lessonsCompleted: number;
  lessonsAvailable: number;
  quizzesPassed: number;
  quizzesAttempted: number;
  perfectQuizzes: number;
  /** Correct answers / total answered across every attempt, 0-1. null when nothing answered. */
  quizAccuracy: number | null;
  videosWatched: number;
  streakDays: number;
  bestSimulatorTier: SimulatorTier | null;
  duoWins: number;
  completedCategories: LessonCategoryId[];
}

/** A quiz counts as "passed" at 60% or better — same threshold the website used for its verdicts. */
export const PASS_RATIO = 0.6;

export function levelFor(totalXp: number, levels: ContentBundle['levels']) {
  const sorted = [...levels].sort((a, b) => a.minXp - b.minXp);
  let current = sorted[0];
  for (const l of sorted) if (totalXp >= l.minXp) current = l;
  const next = sorted.find((l) => l.minXp > current.minXp) ?? null;
  return {
    level: current.level,
    title: current.title,
    xpIntoLevel: totalXp - current.minXp,
    xpForNextLevel: next ? next.minXp - current.minXp : null,
  };
}

/**
 * Total XP obtainable from the current content set. Used as the denominator for the
 * Financial Literacy Score so the score reflects real coverage of real content.
 */
export function availableXp(content: ContentBundle) {
  const lessonXp = content.lessons.reduce((sum, l) => sum + l.xp, 0);
  const videoXp = content.videos.reduce((sum, v) => sum + v.xp, 0);
  const quizXp = content.quizzes.reduce((sum, q) => {
    const count = q.questionIds
      ? q.questionIds.length
      : q.categoryId
        ? content.questions.filter((x) => x.categoryId === q.categoryId).length
        : content.questions.length;
    return sum + count * q.xpPerCorrect;
  }, 0);
  const simulatorXp = 50;
  return { lessonXp, videoXp, quizXp, simulatorXp, total: lessonXp + videoXp + quizXp + simulatorXp };
}

function availableXpByTrack(content: ContentBundle): Record<XpTrackId, number> {
  const out: Record<string, number> = {};
  for (const t of content.tracks) out[t.id] = 0;
  const trackOf = (categoryId: string): XpTrackId =>
    content.categories.find((c) => c.id === categoryId)?.track ?? 'taxes';

  for (const l of content.lessons) out[trackOf(l.categoryId)] += l.xp;
  for (const v of content.videos) {
    const lesson = content.lessons.find((l) => l.id === v.relatedLessonId);
    out[lesson ? trackOf(lesson.categoryId) : 'taxes'] += v.xp;
  }
  for (const q of content.quizzes) {
    const count = q.questionIds
      ? q.questionIds.length
      : q.categoryId
        ? content.questions.filter((x) => x.categoryId === q.categoryId).length
        : content.questions.length;
    out[q.categoryId ? trackOf(q.categoryId) : 'taxes'] += count * q.xpPerCorrect;
  }
  out.saving += 50; // simulator
  return out as Record<XpTrackId, number>;
}

/** Longest run of consecutive days ending today or yesterday. */
export function currentStreak(activeDates: string[], today = new Date()): number {
  if (activeDates.length === 0) return 0;
  const set = new Set(activeDates);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const start = new Date(today);
  if (!set.has(iso(start))) {
    start.setDate(start.getDate() - 1);
    if (!set.has(iso(start))) return 0; // streak already broken
  }

  let streak = 0;
  const cursor = new Date(start);
  while (set.has(iso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function deriveStats(progress: ProgressState, content: ContentBundle): DerivedStats {
  const totalXp = progress.xpEvents.reduce((sum, e) => sum + e.xp, 0);
  const { level, title, xpIntoLevel, xpForNextLevel } = levelFor(totalXp, content.levels);

  const xpByTrack = new Map<XpTrackId, number>();
  for (const e of progress.xpEvents) {
    xpByTrack.set(e.trackId, (xpByTrack.get(e.trackId) ?? 0) + e.xp);
  }
  const avail = availableXpByTrack(content);
  const tracks: TrackStats[] = content.tracks.map((t) => {
    const xp = xpByTrack.get(t.id) ?? 0;
    const available = avail[t.id] ?? 0;
    return { trackId: t.id, xp, available, ratio: available > 0 ? Math.min(1, xp / available) : 0 };
  });

  const lessonsCompleted = Object.values(progress.lessons).filter((l) => l.completed).length;

  const passed = progress.quizAttempts.filter((a) => a.total > 0 && a.score / a.total >= PASS_RATIO);
  // "Passed" counts distinct quizzes, so retries don't inflate the number.
  const quizzesPassed = new Set(passed.map((a) => a.quizId)).size;
  const perfectQuizzes = new Set(
    progress.quizAttempts.filter((a) => a.total > 0 && a.score === a.total).map((a) => a.quizId),
  ).size;
  const answered = progress.quizAttempts.reduce((s, a) => s + a.total, 0);
  const correct = progress.quizAttempts.reduce((s, a) => s + a.score, 0);

  const tierRank: Record<SimulatorTier, number> = { broke: 0, bronze: 1, silver: 2, gold: 3 };
  const bestSimulatorTier =
    progress.simulatorRuns.length === 0
      ? null
      : progress.simulatorRuns.reduce<SimulatorTier>(
          (best, r) => (tierRank[r.tier] > tierRank[best] ? r.tier : best),
          'broke',
        );

  const completedCategories = content.categories
    .filter((cat) => {
      const inCat = content.lessons.filter((l) => l.categoryId === cat.id);
      return (
        inCat.length > 0 && inCat.every((l) => progress.lessons[l.id]?.completed === true)
      );
    })
    .map((c) => c.id);

  const totalAvailable = availableXp(content).total;

  return {
    totalXp,
    level,
    levelTitle: title,
    xpIntoLevel,
    xpForNextLevel,
    literacyScore:
      totalAvailable > 0 ? Math.min(100, Math.round((totalXp / totalAvailable) * 100)) : 0,
    tracks,
    lessonsCompleted,
    lessonsAvailable: content.lessons.length,
    quizzesPassed,
    quizzesAttempted: new Set(progress.quizAttempts.map((a) => a.quizId)).size,
    perfectQuizzes,
    quizAccuracy: answered > 0 ? correct / answered : null,
    videosWatched: Object.values(progress.videos).filter((v) => v.completed).length,
    streakDays: currentStreak(progress.activeDates),
    bestSimulatorTier,
    duoWins: progress.duo.wins,
    completedCategories,
  };
}

/** True when this exact award already exists, so XP is never granted twice. */
export function alreadyAwarded(
  events: XpEvent[],
  reason: XpEvent['reason'],
  refId?: string,
): boolean {
  return events.some((e) => e.reason === reason && e.refId === refId);
}

export function trackForCategory(content: ContentBundle, categoryId: string): XpTrackId {
  return content.categories.find((c) => c.id === categoryId)?.track ?? 'taxes';
}
