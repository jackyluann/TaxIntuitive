import { bundledContent } from '@/content';
import { evaluateAchievements } from '@/lib/xp/achievements';
import { deriveStats } from '@/lib/xp/engine';
import { emptyProgress, type ProgressState } from '@/lib/xp/types';

const statsFor = (progress: ProgressState) => deriveStats(progress, bundledContent);

describe('evaluateAchievements', () => {
  it('awards nothing to a brand-new learner', () => {
    const evaluated = evaluateAchievements(statsFor(emptyProgress()), bundledContent);
    expect(evaluated.length).toBe(bundledContent.achievements.length);
    expect(evaluated.every((a) => !a.earned)).toBe(true);
  });

  it('unlocks the first-lesson badge after one completion', () => {
    const lessonId = bundledContent.lessons[0].id;
    const progress: ProgressState = {
      ...emptyProgress(),
      lessons: { [lessonId]: { opened: true, completed: true, bookmarked: false } },
    };
    const evaluated = evaluateAchievements(statsFor(progress), bundledContent);
    const first = evaluated.find((a) => a.def.id === 'ach-first-lesson');
    expect(first?.earned).toBe(true);
  });

  it('reports partial progress toward a multi-step badge', () => {
    const ids = bundledContent.lessons.slice(0, 2).map((l) => l.id);
    const progress: ProgressState = {
      ...emptyProgress(),
      lessons: Object.fromEntries(
        ids.map((id) => [id, { opened: true, completed: true, bookmarked: false }]),
      ),
    };
    const five = evaluateAchievements(statsFor(progress), bundledContent).find(
      (a) => a.def.id === 'ach-five-lessons',
    );
    expect(five?.earned).toBe(false);
    expect(five?.progress).toBeCloseTo(2 / 5);
  });

  it('treats a gold simulator run as satisfying the bronze badge too', () => {
    const progress: ProgressState = {
      ...emptyProgress(),
      simulatorRuns: [
        {
          id: 'r1',
          at: '2026-09-20T00:00:00Z',
          finalCash: 5000,
          finalSavings: 1000,
          finalDebt: 0,
          moneySmarts: 100,
          maxMoneySmarts: 100,
          tier: 'gold',
          lessons: [],
        },
      ],
    };
    const evaluated = evaluateAchievements(statsFor(progress), bundledContent);
    expect(evaluated.find((a) => a.def.id === 'ach-simulator-survivor')?.earned).toBe(true);
    expect(evaluated.find((a) => a.def.id === 'ach-simulator-gold')?.earned).toBe(true);
  });

  it('does not award the gold simulator badge for a bronze run', () => {
    const progress: ProgressState = {
      ...emptyProgress(),
      simulatorRuns: [
        {
          id: 'r1',
          at: '2026-09-20T00:00:00Z',
          finalCash: 100,
          finalSavings: 0,
          finalDebt: 0,
          moneySmarts: 20,
          maxMoneySmarts: 100,
          tier: 'bronze',
          lessons: [],
        },
      ],
    };
    const evaluated = evaluateAchievements(statsFor(progress), bundledContent);
    expect(evaluated.find((a) => a.def.id === 'ach-simulator-gold')?.earned).toBe(false);
  });

  it('unlocks the XP badge exactly at the threshold', () => {
    const progress: ProgressState = {
      ...emptyProgress(),
      xpEvents: [
        { id: 'e', reason: 'quiz_passed', xp: 500, trackId: 'taxes', at: '2026-09-20T00:00:00Z' },
      ],
    };
    const evaluated = evaluateAchievements(statsFor(progress), bundledContent);
    expect(evaluated.find((a) => a.def.id === 'ach-xp-500')?.earned).toBe(true);
    expect(evaluated.find((a) => a.def.id === 'ach-xp-1250')?.earned).toBe(false);
  });
});
