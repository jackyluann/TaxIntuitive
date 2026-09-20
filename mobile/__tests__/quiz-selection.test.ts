import { bundledContent } from '@/content';
import {
  isoWeekNumber,
  resolveQuizQuestions,
  seededShuffle,
  shuffle,
  weeklyQuestionIds,
} from '@/lib/content/repository';

describe('resolveQuizQuestions', () => {
  it('returns every question in a topic quiz category', () => {
    const quiz = bundledContent.quizzes.find((q) => q.id === 'quiz-slips')!;
    const expected = bundledContent.questions.filter((q) => q.categoryId === quiz.categoryId);
    const resolved = resolveQuizQuestions(bundledContent, quiz.id);
    expect(resolved).toHaveLength(expected.length);
    expect(new Set(resolved.map((q) => q.id))).toEqual(new Set(expected.map((q) => q.id)));
  });

  it('draws from the whole bank for a challenge quiz', () => {
    const resolved = resolveQuizQuestions(bundledContent, 'quiz-challenge-all');
    expect(resolved).toHaveLength(bundledContent.questions.length);
  });

  it('respects a limit', () => {
    const resolved = resolveQuizQuestions(bundledContent, 'quiz-challenge-all', 5);
    expect(resolved).toHaveLength(5);
  });

  it('returns nothing for an unknown quiz instead of throwing', () => {
    expect(resolveQuizQuestions(bundledContent, 'does-not-exist')).toEqual([]);
  });
});

describe('weeklyQuestionIds', () => {
  it('is stable within the same week', () => {
    const monday = new Date('2026-09-21T09:00:00Z');
    const friday = new Date('2026-09-25T18:00:00Z');
    expect(weeklyQuestionIds(bundledContent, monday)).toEqual(
      weeklyQuestionIds(bundledContent, friday),
    );
  });

  it('changes between weeks', () => {
    const thisWeek = weeklyQuestionIds(bundledContent, new Date('2026-09-21T09:00:00Z'));
    const nextWeek = weeklyQuestionIds(bundledContent, new Date('2026-09-28T09:00:00Z'));
    expect(thisWeek).not.toEqual(nextWeek);
  });

  it('returns ten unique real question ids', () => {
    const ids = weeklyQuestionIds(bundledContent, new Date('2026-09-21T09:00:00Z'));
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
    const known = new Set(bundledContent.questions.map((q) => q.id));
    for (const id of ids) expect(known.has(id)).toBe(true);
  });
});

describe('isoWeekNumber', () => {
  it('computes the correct ISO week', () => {
    // 2026-01-01 is a Thursday, so ISO week 1 is Dec 29 2025 - Jan 4 2026.
    expect(isoWeekNumber(new Date('2026-01-05T00:00:00Z'))).toBe(2);
    expect(isoWeekNumber(new Date('2026-09-21T00:00:00Z'))).toBe(39);
    expect(isoWeekNumber(new Date('2026-12-28T00:00:00Z'))).toBe(53);
  });

  it('is timezone-independent so every device gets the same weekly set', () => {
    // Same instant, different local offsets: the week must not change.
    const instant = '2026-09-21T23:30:00Z';
    expect(isoWeekNumber(new Date(instant))).toBe(39);
    expect(isoWeekNumber(new Date('2026-09-22T06:30:00+07:00'))).toBe(39);
  });
});

describe('shuffle', () => {
  it('preserves every element', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(input);
    expect(out).toHaveLength(input.length);
    expect(new Set(out)).toEqual(new Set(input));
  });

  it('does not mutate its input', () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });
});

describe('seededShuffle', () => {
  const input = Array.from({ length: 20 }, (_, i) => i);

  it('is deterministic for a given seed', () => {
    expect(seededShuffle(input, 7)).toEqual(seededShuffle(input, 7));
  });

  it('produces a different order for a different seed', () => {
    expect(seededShuffle(input, 1)).not.toEqual(seededShuffle(input, 2));
  });

  it('preserves every element and does not mutate the input', () => {
    const copy = [...input];
    const out = seededShuffle(input, 42);
    expect(out).toHaveLength(input.length);
    expect(new Set(out)).toEqual(new Set(input));
    expect(input).toEqual(copy);
  });

  it('handles a zero seed without collapsing', () => {
    const out = seededShuffle(input, 0);
    expect(new Set(out)).toEqual(new Set(input));
  });

  it('makes quiz ordering reproducible, so a re-render never reshuffles', () => {
    const a = resolveQuizQuestions(bundledContent, 'quiz-challenge-all', undefined, 99);
    const b = resolveQuizQuestions(bundledContent, 'quiz-challenge-all', undefined, 99);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
});
