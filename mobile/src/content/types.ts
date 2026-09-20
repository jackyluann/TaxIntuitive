/**
 * Content model for TaxIntuitive.
 *
 * These types are the contract between the bundled seed content (src/content/*.ts) and the
 * Supabase `content_*` tables. Screens never hard-code copy: they render whatever conforms to
 * these shapes, so lessons/quizzes/videos/FAQs/workshops can be edited in Supabase later
 * without touching screen code.
 */

export type LessonCategoryId =
  | 'tax-basics'
  | 'your-paycheque'
  | 'slips-and-documents'
  | 'first-tax-return'
  | 'deadlines-and-penalties'
  | 'credits-and-benefits'
  | 'employment-and-gig-income'
  | 'saving-and-investing'
  | 'tfsa-and-rrsp'
  | 'banking-and-credit'
  | 'tax-glossary';

export interface LessonCategory {
  id: LessonCategoryId;
  title: string;
  blurb: string;
  emoji: string;
  /** Which XP track completing this category's lessons feeds. */
  track: XpTrackId;
  order: number;
}

/**
 * A renderable content block. Mirrors the visual vocabulary of the TaxIntuitive website
 * (tips, warnings, takeaway panels, paycheque flow diagram, slip cards, comparison tables)
 * so the brand personality survives the move to native.
 */
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'numbered'; items: string[] }
  | { type: 'tip'; title?: string; text: string }
  | { type: 'warning'; title?: string; text: string }
  | { type: 'example'; title?: string; text: string }
  | { type: 'flow'; steps: FlowStep[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'slips'; items: { tag: string; text: string }[] }
  | { type: 'terms'; items: string[] };

export interface FlowStep {
  label: string;
  caption?: string;
  tone?: 'neutral' | 'minus' | 'plus';
}

/** An official source a lesson's facts can be traced back to. */
export interface OfficialSource {
  label: string;
  url: string;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  categoryId: LessonCategoryId;
  /** 'lesson' = Learning Hub material, 'guide' = the homepage plain-language how-to guides. */
  kind: 'lesson' | 'guide';
  summary: string;
  readingMinutes: number;
  body: ContentBlock[];
  keyTakeaways: string[];
  officialSources: OfficialSource[];
  /** ISO date. Tax content must show when it was last checked against CRA guidance. */
  lastReviewed: string;
  /**
   * True when the lesson states time-sensitive facts (deadlines, penalties, rates, limits,
   * eligibility ages) that must be re-verified against canada.ca before release.
   * Surfaced in the UI as an "needs review" state so nothing unverified ships silently.
   */
  needsVerification: boolean;
  relatedVideoId?: string;
  relatedQuizId?: string;
  xp: number;
  order: number;
  featured?: boolean;
}

export type QuizKind = 'topic' | 'weekly' | 'challenge';

export interface QuizQuestion {
  id: string;
  /** Quiz category, matches a lesson category so a wrong answer can recommend a lesson. */
  categoryId: LessonCategoryId;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  /** Lesson to recommend when the learner gets this wrong. */
  teachesLessonId?: string;
}

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  kind: QuizKind;
  categoryId?: LessonCategoryId;
  /** Explicit question ids, or omit to pull every question in `categoryId`. */
  questionIds?: string[];
  /** For 'weekly': ISO week start this quiz is featured. */
  featuredFrom?: string;
  xpPerCorrect: number;
  order: number;
}

export interface Video {
  id: string;
  title: string;
  /** Plain-language question this episode answers. */
  question: string;
  description: string;
  category: string;
  /** YouTube id. Empty string = not filmed yet; UI shows a "coming soon" state. */
  youtubeId: string;
  durationSeconds?: number;
  transcript?: string;
  captionsAvailable: boolean;
  relatedLessonId?: string;
  relatedQuizId?: string;
  featured?: boolean;
  xp: number;
  order: number;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  categoryId?: LessonCategoryId;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export type WorkshopStatus = 'upcoming' | 'past' | 'cancelled';

export interface Workshop {
  id: string;
  title: string;
  description: string;
  /** ISO datetime. */
  startsAt: string;
  endsAt?: string;
  locationName?: string;
  address?: string;
  /** True for online sessions; hides map/directions. */
  online: boolean;
  registrationUrl?: string;
  status: WorkshopStatus;
  audience?: string;
}

/* ------------------------------------------------------------------ simulator */

export interface SimulatorOption {
  id: string;
  label: string;
  /** Change to cash balance, in dollars. */
  cashDelta: number;
  /** Change to the Money Smarts score. */
  smartsDelta: number;
  /** Optional effects on the other tracked figures. */
  savingsDelta?: number;
  debtDelta?: number;
  estimatedTaxDelta?: number;
  incomeDelta?: number;
  expenseDelta?: number;
  /** Plain-language consequence shown right after the choice. */
  feedback: string;
  /** Durable money lesson collected in the end-of-run summary. */
  lesson?: string;
}

export interface SimulatorScenario {
  id: string;
  /** e.g. "Month 1 — Getting hired" */
  monthLabel: string;
  prompt: string;
  categoryId?: LessonCategoryId;
  options: SimulatorOption[];
  order: number;
}

export interface SimulatorConfig {
  startingCash: number;
  startingAge: number;
  hourlyWage: number;
  scenarios: SimulatorScenario[];
}

/* ------------------------------------------------------------------------- xp */

export type XpTrackId = 'taxes' | 'banking' | 'credit' | 'saving' | 'investing';

export interface XpTrack {
  id: XpTrackId;
  title: string;
  /** Theme token name, resolved per color scheme. */
  colorToken: 'taxes' | 'banking' | 'credit' | 'saving' | 'investing';
  order: number;
}

/** Why XP was awarded. Progress is always derived from these, never hard-coded. */
export type XpReason =
  | 'lesson_opened'
  | 'lesson_completed'
  | 'quiz_passed'
  | 'quiz_improved'
  | 'quiz_perfect'
  | 'video_watched'
  | 'simulator_completed'
  | 'challenge_completed'
  | 'duo_win'
  | 'duo_played'
  | 'streak_day';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  tier: 'bronze' | 'silver' | 'gold';
  /** Evaluated against derived stats; see src/lib/xp/achievements.ts */
  rule:
    | { kind: 'lessons_completed'; count: number }
    | { kind: 'quizzes_passed'; count: number }
    | { kind: 'perfect_quiz'; count: number }
    | { kind: 'total_xp'; amount: number }
    | { kind: 'streak_days'; days: number }
    | { kind: 'simulator_tier'; tier: 'bronze' | 'silver' | 'gold' }
    | { kind: 'duo_wins'; count: number }
    | { kind: 'category_complete'; categoryId: LessonCategoryId };
  order: number;
}

export interface LevelDef {
  level: number;
  title: string;
  minXp: number;
}

/* --------------------------------------------------------------- content bundle */

/** Everything the app needs to run offline, bundled at build time and refreshable from Supabase. */
export interface ContentBundle {
  version: number;
  generatedAt: string;
  categories: LessonCategory[];
  lessons: Lesson[];
  quizzes: Quiz[];
  questions: QuizQuestion[];
  videos: Video[];
  glossary: GlossaryTerm[];
  faqs: Faq[];
  workshops: Workshop[];
  simulator: SimulatorConfig;
  tracks: XpTrack[];
  achievements: AchievementDef[];
  levels: LevelDef[];
}
