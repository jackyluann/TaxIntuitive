import { bundledContent, CONTENT_VERSION } from '@/content';
import type {
  ContentBundle,
  ContentBlock,
  Lesson,
  OfficialSource,
  Quiz,
  QuizQuestion,
  Video,
  Faq,
  Workshop,
  GlossaryTerm,
  SimulatorScenario,
  AchievementDef,
  LessonCategory,
  LessonCategoryId,
  XpTrackId,
} from '@/content/types';
import type {
  ContentAchievementRow,
  ContentCategoryRow,
  ContentFaqRow,
  ContentGlossaryRow,
  ContentLessonRow,
  ContentQuestionRow,
  ContentQuizRow,
  ContentSimulatorScenarioRow,
  ContentVideoRow,
  ContentWorkshopRow,
} from '@/lib/supabase/database.types';
import { readJson, writeJson, StorageKeys } from '@/lib/storage/local';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

/**
 * Content loading strategy, in priority order:
 *   1. bundled content  — always present, so a first launch works with no network
 *   2. cached content   — last successful fetch, so edits survive going offline
 *   3. Supabase         — refreshed in the background; newest wins
 *
 * A failed or partial fetch never degrades the app: we keep whatever we already had.
 */

interface CachedBundle {
  version: number;
  fetchedAt: string;
  bundle: ContentBundle;
}

export async function loadCachedContent(): Promise<ContentBundle> {
  const cached = await readJson<CachedBundle>(StorageKeys.contentCache);
  if (!cached?.bundle) return bundledContent;
  // A newer app build wins over an older cache so shipped fixes are never masked.
  if (cached.version < CONTENT_VERSION) return bundledContent;
  return cached.bundle;
}

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

const asBlocks = (v: unknown): ContentBlock[] => (Array.isArray(v) ? (v as ContentBlock[]) : []);

const asSources = (v: unknown): OfficialSource[] =>
  Array.isArray(v)
    ? (v as OfficialSource[]).filter((s) => s && typeof s.label === 'string' && typeof s.url === 'string')
    : [];

/**
 * Fetches content from Supabase. Returns null when Supabase isn't configured or the fetch
 * fails, which the caller treats as "keep current content".
 */
export async function fetchRemoteContent(): Promise<ContentBundle | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [
      categories,
      lessons,
      quizzes,
      questions,
      videos,
      glossary,
      faqs,
      workshops,
      scenarios,
      achievements,
    ] = await Promise.all([
      supabase.from('content_categories').select('*').order('sort_order'),
      supabase.from('content_lessons').select('*').eq('published', true).order('sort_order'),
      supabase.from('content_quizzes').select('*').eq('published', true).order('sort_order'),
      supabase.from('content_questions').select('*').eq('published', true),
      supabase.from('content_videos').select('*').eq('published', true).order('sort_order'),
      supabase.from('content_glossary').select('*'),
      supabase.from('content_faqs').select('*').eq('published', true).order('sort_order'),
      supabase
        .from('content_workshops')
        .select('*')
        .eq('published', true)
        .order('starts_at'),
      supabase
        .from('content_simulator_scenarios')
        .select('*')
        .eq('published', true)
        .order('sort_order'),
      supabase.from('content_achievements').select('*').order('sort_order'),
    ]);

    // If the content tables are empty or unreachable, stay on bundled content.
    if (!categories.data?.length || !lessons.data?.length) return null;

    // Row shapes applied explicitly (the client is intentionally untyped; see client.ts).
    const categoryRows = categories.data as ContentCategoryRow[];
    const lessonRows = lessons.data as ContentLessonRow[];
    const quizRows = (quizzes.data ?? []) as ContentQuizRow[];
    const questionRows = (questions.data ?? []) as ContentQuestionRow[];
    const videoRows = (videos.data ?? []) as ContentVideoRow[];
    const glossaryRows = (glossary.data ?? []) as ContentGlossaryRow[];
    const faqRows = (faqs.data ?? []) as ContentFaqRow[];
    const workshopRows = (workshops.data ?? []) as ContentWorkshopRow[];
    const scenarioRows = (scenarios.data ?? []) as ContentSimulatorScenarioRow[];
    const achievementRows = (achievements.data ?? []) as ContentAchievementRow[];

    const mapped: ContentBundle = {
      version: CONTENT_VERSION,
      generatedAt: new Date().toISOString(),
      categories: categoryRows.map<LessonCategory>((c) => ({
        id: c.id as LessonCategoryId,
        title: c.title,
        blurb: c.blurb,
        emoji: c.emoji,
        track: c.track as XpTrackId,
        order: c.sort_order,
      })),
      lessons: lessonRows.map<Lesson>((l) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        categoryId: l.category_id as LessonCategoryId,
        kind: l.kind,
        summary: l.summary,
        readingMinutes: l.reading_minutes,
        body: asBlocks(l.body),
        keyTakeaways: asStringArray(l.key_takeaways),
        officialSources: asSources(l.official_sources),
        lastReviewed: l.last_reviewed,
        needsVerification: l.needs_verification,
        relatedVideoId: l.related_video_id ?? undefined,
        relatedQuizId: l.related_quiz_id ?? undefined,
        xp: l.xp,
        order: l.sort_order,
        featured: l.featured,
      })),
      quizzes: quizRows.map<Quiz>((q) => ({
        id: q.id,
        slug: q.slug,
        title: q.title,
        description: q.description,
        emoji: q.emoji,
        kind: q.kind,
        categoryId: (q.category_id ?? undefined) as LessonCategoryId | undefined,
        questionIds: q.question_ids ? asStringArray(q.question_ids) : undefined,
        featuredFrom: q.featured_from ?? undefined,
        xpPerCorrect: q.xp_per_correct,
        order: q.sort_order,
      })),
      questions: questionRows.map<QuizQuestion>((q) => ({
        id: q.id,
        categoryId: q.category_id as LessonCategoryId,
        prompt: q.prompt,
        options: asStringArray(q.options),
        answerIndex: q.answer_index,
        difficulty: q.difficulty ?? undefined,
        explanation: q.explanation,
        teachesLessonId: q.teaches_lesson_id ?? undefined,
      })),
      videos: videoRows.map<Video>((v) => ({
        id: v.id,
        title: v.title,
        question: v.question,
        description: v.description,
        category: v.category,
        youtubeId: v.youtube_id,
        durationSeconds: v.duration_seconds ?? undefined,
        transcript: v.transcript ?? undefined,
        captionsAvailable: v.captions_available,
        relatedLessonId: v.related_lesson_id ?? undefined,
        relatedQuizId: v.related_quiz_id ?? undefined,
        featured: v.featured,
        xp: v.xp,
        order: v.sort_order,
      })),
      glossary: glossaryRows.map<GlossaryTerm>((g) => ({
        term: g.term,
        definition: g.definition,
        categoryId: (g.category_id ?? undefined) as LessonCategoryId | undefined,
      })),
      faqs: faqRows.map<Faq>((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        order: f.sort_order,
      })),
      workshops: workshopRows.map<Workshop>((w) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        startsAt: w.starts_at,
        endsAt: w.ends_at ?? undefined,
        locationName: w.location_name ?? undefined,
        address: w.address ?? undefined,
        online: w.online,
        registrationUrl: w.registration_url ?? undefined,
        status: w.status,
        audience: w.audience ?? undefined,
      })),
      simulator: scenarioRows.length
        ? {
            ...bundledContent.simulator,
            scenarios: scenarioRows.map<SimulatorScenario>((s) => ({
              id: s.id,
              monthLabel: s.month_label,
              prompt: s.prompt,
              categoryId: (s.category_id ?? undefined) as LessonCategoryId | undefined,
              options: Array.isArray(s.options)
                ? (s.options as unknown as SimulatorScenario['options'])
                : [],
              order: s.sort_order,
            })),
          }
        : bundledContent.simulator,
      tracks: bundledContent.tracks,
      achievements: achievementRows.length
        ? achievementRows.map<AchievementDef>((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            emoji: a.emoji,
            tier: a.tier,
            rule: a.rule as AchievementDef['rule'],
            order: a.sort_order,
          }))
        : bundledContent.achievements,
      levels: bundledContent.levels,
    };

    await writeJson(StorageKeys.contentCache, {
      version: CONTENT_VERSION,
      fetchedAt: new Date().toISOString(),
      bundle: mapped,
    } satisfies CachedBundle);

    return mapped;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ selectors */

export const resolveQuizQuestions = (
  content: ContentBundle,
  quizId: string,
  limit?: number,
  /**
   * Deterministic ordering seed. Given the same seed the order never changes, which keeps the
   * question list a pure derivation (safe to compute in a useMemo) instead of a stored side effect.
   * Omit for a random order.
   */
  seed?: number,
): QuizQuestion[] => {
  const quiz = content.quizzes.find((q) => q.id === quizId);
  if (!quiz) return [];
  let pool: QuizQuestion[];
  if (quiz.questionIds?.length) {
    pool = quiz.questionIds
      .map((id) => content.questions.find((q) => q.id === id))
      .filter((q): q is QuizQuestion => Boolean(q));
  } else if (quiz.categoryId) {
    pool = content.questions.filter((q) => q.categoryId === quiz.categoryId);
  } else {
    pool = [...content.questions];
  }
  const ordered = seed === undefined ? shuffle(pool) : seededShuffle(pool, seed);
  return limit && ordered.length > limit ? ordered.slice(0, limit) : ordered;
};

/**
 * Deterministic Fisher-Yates using a mulberry32 PRNG. Same seed, same order, every time —
 * which is what lets a screen derive its question order without storing it in state.
 */
export function seededShuffle<T>(input: T[], seed: number): T[] {
  const a = [...input];
  let state = (seed >>> 0) || 1;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let x = state;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shuffle<T>(input: T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Quiz of the Week: a stable 10-question set that changes each ISO week. */
export function weeklyQuestionIds(content: ContentBundle, date = new Date()): string[] {
  const week = isoWeekNumber(date);
  const ordered = [...content.questions].sort((a, b) => a.id.localeCompare(b.id));
  if (ordered.length === 0) return [];
  const size = Math.min(10, ordered.length);
  const start = (week * size) % ordered.length;
  return Array.from({ length: size }, (_, i) => ordered[(start + i) % ordered.length].id);
}

export function isoWeekNumber(date: Date): number {
  // UTC getters throughout: the weekly set must be identical on every device, regardless of
  // timezone. Mixing local getters with Date.UTC() would roll the quiz over at different moments.
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
