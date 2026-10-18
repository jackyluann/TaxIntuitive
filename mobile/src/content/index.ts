/**
 * Bundled content. This is the offline seed: the app ships with it so a first launch works
 * with no network, and `src/lib/content/repository.ts` overlays newer content from Supabase
 * when it is available.
 *
 * To change copy, edit these files (or the matching `content_*` table in Supabase).
 * Screens never hard-code content.
 */
import { categories, tracks, levels } from './categories';
import { lessons } from './lessons';
import { quizzes, questions } from './quizzes';
import { videos } from './videos';
import { glossary } from './glossary';
import { faqs } from './faqs';
import { workshops } from './workshops';
import { simulator } from './simulator';
import { achievements } from './achievements';
import type { ContentBundle } from './types';

/** Bump when seed content changes so caches know to refresh. */
export const CONTENT_VERSION = 2;

export const bundledContent: ContentBundle = {
  version: CONTENT_VERSION,
  generatedAt: '2026-10-18',
  categories,
  lessons,
  quizzes,
  questions,
  videos,
  glossary,
  faqs,
  workshops,
  simulator,
  tracks,
  achievements,
  levels,
};

export * from './types';
export { categories, tracks, levels, categoryById } from './categories';
export { lessons, lessonById, lessonsByCategory, guides, featuredLessons } from './lessons';
export {
  quizzes,
  questions,
  quizById,
  questionById,
  questionsForCategory,
} from './quizzes';
export { videos, videoById, publishedVideos, videoCategories } from './videos';
export { glossary, glossaryTerm } from './glossary';
export { faqs } from './faqs';
export { workshops, contact } from './workshops';
export { simulator } from './simulator';
export { achievements } from './achievements';

/** The educational disclaimer. Required wording — display wherever tax content appears. */
export const DISCLAIMER =
  'TaxIntuitive provides general educational information and is not a substitute for professional tax, legal, or financial advice. Canadian tax rules can change. Confirm current information through the Canada Revenue Agency or another official Government of Canada source.';

export const CRA_URL = 'https://www.canada.ca/en/revenue-agency.html';
