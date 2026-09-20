import { mergeProgress } from '@/providers/progress';
import { emptyProgress, type ProgressState } from '@/lib/xp/types';

/** Merging guest data into an account must never lose history or double-count XP. */
describe('mergeProgress', () => {
  const guest: ProgressState = {
    ...emptyProgress(),
    xpEvents: [
      { id: 'g1', reason: 'lesson_completed', xp: 10, trackId: 'taxes', refId: 'l1', at: '2026-09-18T00:00:00Z' },
      { id: 'g2', reason: 'quiz_passed', xp: 20, trackId: 'taxes', refId: 'q1', at: '2026-09-18T01:00:00Z' },
    ],
    lessons: {
      l1: { opened: true, completed: true, bookmarked: false, scrollProgress: 1, lastOpenedAt: '2026-09-18T00:00:00Z' },
      l2: { opened: true, completed: false, bookmarked: true, scrollProgress: 0.4, lastOpenedAt: '2026-09-19T00:00:00Z' },
    },
    quizAttempts: [
      { id: 'a1', quizId: 'q1', score: 5, total: 6, at: '2026-09-18T01:00:00Z', wrongQuestionIds: ['x'] },
    ],
    duo: { wins: 1, losses: 0, ties: 0 },
    activeDates: ['2026-09-18', '2026-09-19'],
  };

  it('dedupes XP that both sides already have', () => {
    const account: ProgressState = {
      ...emptyProgress(),
      xpEvents: [
        { id: 'a1', reason: 'lesson_completed', xp: 10, trackId: 'taxes', refId: 'l1', at: '2026-09-20T00:00:00Z' },
      ],
    };
    const merged = mergeProgress(account, guest);
    // l1 completion exists on both sides — it must appear exactly once.
    const l1Awards = merged.xpEvents.filter(
      (e) => e.reason === 'lesson_completed' && e.refId === 'l1',
    );
    expect(l1Awards).toHaveLength(1);
    // The quiz award only the guest had still carries over.
    expect(merged.xpEvents.some((e) => e.refId === 'q1')).toBe(true);
    expect(merged.xpEvents).toHaveLength(2);
  });

  it('keeps a completion from either side', () => {
    const account: ProgressState = {
      ...emptyProgress(),
      lessons: { l1: { opened: true, completed: false, bookmarked: false } },
    };
    const merged = mergeProgress(account, guest);
    expect(merged.lessons.l1.completed).toBe(true);
    expect(merged.lessons.l2.bookmarked).toBe(true);
  });

  it('takes the furthest scroll position', () => {
    const account: ProgressState = {
      ...emptyProgress(),
      lessons: { l2: { opened: true, completed: false, bookmarked: false, scrollProgress: 0.9 } },
    };
    const merged = mergeProgress(account, guest);
    expect(merged.lessons.l2.scrollProgress).toBe(0.9);
  });

  it('concatenates attempt history without duplicating identical attempts', () => {
    const account: ProgressState = { ...emptyProgress(), quizAttempts: guest.quizAttempts };
    const merged = mergeProgress(account, guest);
    expect(merged.quizAttempts).toHaveLength(1);
  });

  it('adds up duo records and unions active days', () => {
    const account: ProgressState = {
      ...emptyProgress(),
      duo: { wins: 2, losses: 1, ties: 0 },
      activeDates: ['2026-09-19', '2026-09-20'],
    };
    const merged = mergeProgress(account, guest);
    expect(merged.duo).toEqual({ wins: 3, losses: 1, ties: 0 });
    expect(merged.activeDates).toEqual(['2026-09-18', '2026-09-19', '2026-09-20']);
  });

  it('is a no-op when the guest has nothing', () => {
    const account: ProgressState = {
      ...emptyProgress(),
      xpEvents: guest.xpEvents,
      lessons: guest.lessons,
    };
    const merged = mergeProgress(account, emptyProgress());
    expect(merged.xpEvents).toHaveLength(2);
    expect(Object.keys(merged.lessons)).toHaveLength(2);
  });
});
