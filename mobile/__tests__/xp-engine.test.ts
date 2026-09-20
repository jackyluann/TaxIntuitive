import { bundledContent } from '@/content';
import {
  alreadyAwarded,
  availableXp,
  currentStreak,
  deriveStats,
  levelFor,
  PASS_RATIO,
} from '@/lib/xp/engine';
import { emptyProgress, type ProgressState, type XpEvent } from '@/lib/xp/types';

const event = (over: Partial<XpEvent> = {}): XpEvent => ({
  id: Math.random().toString(36).slice(2),
  reason: 'lesson_completed',
  xp: 10,
  trackId: 'taxes',
  at: '2026-09-20T12:00:00.000Z',
  ...over,
});

describe('levelFor', () => {
  it('starts everyone at level 1 with zero XP', () => {
    const r = levelFor(0, bundledContent.levels);
    expect(r.level).toBe(1);
    expect(r.xpIntoLevel).toBe(0);
  });

  it('reports progress into the current level', () => {
    // Level 2 begins at 50 XP.
    const r = levelFor(60, bundledContent.levels);
    expect(r.level).toBe(2);
    expect(r.xpIntoLevel).toBe(10);
    expect(r.xpForNextLevel).toBe(75); // 125 - 50
  });

  it('caps out at the highest level with no next threshold', () => {
    const r = levelFor(999_999, bundledContent.levels);
    expect(r.level).toBe(10);
    expect(r.xpForNextLevel).toBeNull();
  });
});

describe('currentStreak', () => {
  const today = new Date('2026-09-20T10:00:00.000Z');

  it('is zero with no activity', () => {
    expect(currentStreak([], today)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    expect(currentStreak(['2026-09-18', '2026-09-19', '2026-09-20'], today)).toBe(3);
  });

  it('still counts a streak that ended yesterday (today not over yet)', () => {
    expect(currentStreak(['2026-09-18', '2026-09-19'], today)).toBe(2);
  });

  it('breaks when there is a gap', () => {
    expect(currentStreak(['2026-09-14', '2026-09-15', '2026-09-20'], today)).toBe(1);
  });

  it('returns zero when the last activity is too old', () => {
    expect(currentStreak(['2026-09-01'], today)).toBe(0);
  });
});

describe('alreadyAwarded', () => {
  it('matches on reason and ref together', () => {
    const events = [event({ reason: 'lesson_completed', refId: 'a' })];
    expect(alreadyAwarded(events, 'lesson_completed', 'a')).toBe(true);
    expect(alreadyAwarded(events, 'lesson_completed', 'b')).toBe(false);
    expect(alreadyAwarded(events, 'lesson_opened', 'a')).toBe(false);
  });
});

describe('deriveStats', () => {
  it('derives an empty profile without crashing', () => {
    const stats = deriveStats(emptyProgress(), bundledContent);
    expect(stats.totalXp).toBe(0);
    expect(stats.literacyScore).toBe(0);
    expect(stats.quizAccuracy).toBeNull();
    expect(stats.bestSimulatorTier).toBeNull();
    expect(stats.lessonsAvailable).toBe(bundledContent.lessons.length);
  });

  it('sums XP and splits it by track', () => {
    const progress: ProgressState = {
      ...emptyProgress(),
      xpEvents: [
        event({ xp: 10, trackId: 'taxes' }),
        event({ xp: 15, trackId: 'taxes' }),
        event({ xp: 5, trackId: 'credit' }),
      ],
    };
    const stats = deriveStats(progress, bundledContent);
    expect(stats.totalXp).toBe(30);
    expect(stats.tracks.find((x) => x.trackId === 'taxes')?.xp).toBe(25);
    expect(stats.tracks.find((x) => x.trackId === 'credit')?.xp).toBe(5);
  });

  it('counts a quiz as passed only at or above the pass ratio, and dedupes retries', () => {
    const quizId = bundledContent.quizzes[1].id;
    const progress: ProgressState = {
      ...emptyProgress(),
      quizAttempts: [
        { id: '1', quizId, score: 1, total: 10, at: '2026-09-19T00:00:00Z', wrongQuestionIds: [] },
        { id: '2', quizId, score: 9, total: 10, at: '2026-09-20T00:00:00Z', wrongQuestionIds: [] },
        { id: '3', quizId, score: 10, total: 10, at: '2026-09-20T01:00:00Z', wrongQuestionIds: [] },
      ],
    };
    const stats = deriveStats(progress, bundledContent);
    expect(PASS_RATIO).toBe(0.6);
    expect(stats.quizzesPassed).toBe(1); // same quiz, counted once
    expect(stats.perfectQuizzes).toBe(1);
    expect(stats.quizAccuracy).toBeCloseTo(20 / 30);
  });

  it('marks a category complete only when every lesson in it is done', () => {
    const categoryId = 'your-paycheque';
    const inCategory = bundledContent.lessons.filter((l) => l.categoryId === categoryId);
    expect(inCategory.length).toBeGreaterThan(0);

    const partial: ProgressState = {
      ...emptyProgress(),
      lessons: {
        [inCategory[0].id]: { opened: true, completed: true, bookmarked: false },
      },
    };
    const partialStats = deriveStats(partial, bundledContent);
    if (inCategory.length > 1) {
      expect(partialStats.completedCategories).not.toContain(categoryId);
    }

    const all: ProgressState = {
      ...emptyProgress(),
      lessons: Object.fromEntries(
        inCategory.map((l) => [l.id, { opened: true, completed: true, bookmarked: false }]),
      ),
    };
    expect(deriveStats(all, bundledContent).completedCategories).toContain(categoryId);
  });

  it('never reports a literacy score above 100', () => {
    const huge: ProgressState = {
      ...emptyProgress(),
      xpEvents: [event({ xp: 1_000_000 })],
    };
    expect(deriveStats(huge, bundledContent).literacyScore).toBe(100);
  });
});

describe('availableXp', () => {
  it('reports a positive total drawn from real content', () => {
    const a = availableXp(bundledContent);
    expect(a.lessonXp).toBeGreaterThan(0);
    expect(a.quizXp).toBeGreaterThan(0);
    expect(a.total).toBe(a.lessonXp + a.videoXp + a.quizXp + a.simulatorXp);
  });
});
