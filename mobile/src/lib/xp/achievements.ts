import type { AchievementDef, ContentBundle } from '@/content/types';
import type { DerivedStats } from './engine';

export interface EvaluatedAchievement {
  def: AchievementDef;
  earned: boolean;
  /** 0-1 progress toward earning it, for the "almost there" UI. */
  progress: number;
}

const ratio = (have: number, need: number) => (need <= 0 ? 1 : Math.min(1, have / need));

const TIER_RANK = { broke: 0, bronze: 1, silver: 2, gold: 3 } as const;

/** Evaluates every achievement against derived stats. No badge is ever awarded by hand. */
export function evaluateAchievements(
  stats: DerivedStats,
  content: ContentBundle,
): EvaluatedAchievement[] {
  return content.achievements
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((def) => {
      let progress = 0;
      switch (def.rule.kind) {
        case 'lessons_completed':
          progress = ratio(stats.lessonsCompleted, def.rule.count);
          break;
        case 'quizzes_passed':
          progress = ratio(stats.quizzesPassed, def.rule.count);
          break;
        case 'perfect_quiz':
          progress = ratio(stats.perfectQuizzes, def.rule.count);
          break;
        case 'total_xp':
          progress = ratio(stats.totalXp, def.rule.amount);
          break;
        case 'streak_days':
          progress = ratio(stats.streakDays, def.rule.days);
          break;
        case 'duo_wins':
          progress = ratio(stats.duoWins, def.rule.count);
          break;
        case 'simulator_tier': {
          const have = stats.bestSimulatorTier ? TIER_RANK[stats.bestSimulatorTier] : 0;
          const need = TIER_RANK[def.rule.tier];
          progress = stats.bestSimulatorTier === null ? 0 : ratio(have, need);
          break;
        }
        case 'category_complete':
          progress = stats.completedCategories.includes(def.rule.categoryId) ? 1 : 0;
          break;
      }
      return { def, earned: progress >= 1, progress };
    });
}
