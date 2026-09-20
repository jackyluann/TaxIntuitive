import { bundledContent } from '@/content';

/**
 * Guards the content layer. Because screens are data-driven, a bad id or out-of-range answer
 * would surface as a broken screen at runtime — these tests catch it at build time instead.
 */
describe('content integrity', () => {
  const {
    categories,
    lessons,
    quizzes,
    questions,
    videos,
    faqs,
    simulator,
    achievements,
    levels,
    tracks,
  } = bundledContent;

  it('has content in every collection that screens depend on', () => {
    expect(categories.length).toBeGreaterThan(0);
    expect(lessons.length).toBeGreaterThan(0);
    expect(quizzes.length).toBeGreaterThan(0);
    expect(questions.length).toBeGreaterThan(0);
    expect(videos.length).toBeGreaterThan(0);
    expect(faqs.length).toBeGreaterThan(0);
    expect(simulator.scenarios.length).toBeGreaterThan(0);
    expect(achievements.length).toBeGreaterThan(0);
  });

  it('uses unique ids everywhere', () => {
    const unique = (ids: string[]) => expect(new Set(ids).size).toBe(ids.length);
    unique(lessons.map((l) => l.id));
    unique(lessons.map((l) => l.slug));
    unique(quizzes.map((q) => q.id));
    unique(questions.map((q) => q.id));
    unique(videos.map((v) => v.id));
    unique(faqs.map((f) => f.id));
    unique(achievements.map((a) => a.id));
    unique(simulator.scenarios.map((s) => s.id));
    unique(categories.map((c) => c.id));
  });

  it('points every lesson at a real category and track', () => {
    const categoryIds = new Set(categories.map((c) => c.id));
    const trackIds = new Set(tracks.map((t) => t.id));
    for (const lesson of lessons) {
      expect(categoryIds.has(lesson.categoryId)).toBe(true);
    }
    for (const category of categories) {
      expect(trackIds.has(category.track)).toBe(true);
    }
  });

  it('resolves every cross-reference between lessons, quizzes and videos', () => {
    const lessonIds = new Set(lessons.map((l) => l.id));
    const quizIds = new Set(quizzes.map((q) => q.id));
    const videoIds = new Set(videos.map((v) => v.id));

    for (const lesson of lessons) {
      if (lesson.relatedQuizId) expect(quizIds.has(lesson.relatedQuizId)).toBe(true);
      if (lesson.relatedVideoId) expect(videoIds.has(lesson.relatedVideoId)).toBe(true);
    }
    for (const video of videos) {
      if (video.relatedLessonId) expect(lessonIds.has(video.relatedLessonId)).toBe(true);
      if (video.relatedQuizId) expect(quizIds.has(video.relatedQuizId)).toBe(true);
    }
    for (const question of questions) {
      if (question.teachesLessonId) expect(lessonIds.has(question.teachesLessonId)).toBe(true);
    }
  });

  it('keeps every question answerable', () => {
    for (const q of questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThan(q.options.length);
      expect(q.explanation.trim().length).toBeGreaterThan(0);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it('gives every topic quiz at least one question', () => {
    for (const quiz of quizzes) {
      if (quiz.kind !== 'topic') continue;
      const count = quiz.questionIds
        ? quiz.questionIds.length
        : questions.filter((q) => q.categoryId === quiz.categoryId).length;
      expect(count).toBeGreaterThan(0);
    }
  });

  it('requires a source and review date on every lesson', () => {
    for (const lesson of lessons) {
      expect(lesson.officialSources.length).toBeGreaterThan(0);
      expect(lesson.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(lesson.keyTakeaways.length).toBeGreaterThan(0);
      expect(lesson.body.length).toBeGreaterThan(0);
      for (const source of lesson.officialSources) {
        expect(source.url.startsWith('https://')).toBe(true);
      }
    }
  });

  it('flags time-sensitive lessons for annual verification', () => {
    // Deadlines and penalties change; that lesson must never be marked as settled fact.
    const deadlines = lessons.find((l) => l.id === 'lesson-deadlines');
    expect(deadlines?.needsVerification).toBe(true);
  });

  it('is Canadian: no American tax artifacts in user-facing copy', () => {
    const haystack = JSON.stringify({ lessons, questions, videos, faqs }).toLowerCase();
    // A W-2 mention is only acceptable where we explicitly contrast it with the T4.
    const w2Mentions = (haystack.match(/w-2/g) ?? []).length;
    const contrastMentions = (haystack.match(/canadian equivalent|equivalent of the american/g) ?? [])
      .length;
    expect(w2Mentions).toBeLessThanOrEqual(contrastMentions * 2);
    // Word-boundary matching: a bare substring check would hit "f-irs-t", "the-irs".
    expect(haystack).not.toMatch(/\birs\b/);
    expect(haystack).not.toMatch(/\b401\(k\)/);
    expect(haystack).not.toMatch(/\bsocial security\b/);
    expect(haystack).not.toMatch(/\bfederal tax return\b/);
  });

  it('omits the unverifiable marketing statistics from the website', () => {
    const haystack = JSON.stringify(bundledContent);
    expect(haystack).not.toContain('500k+');
    expect(haystack).not.toContain('Young Adults Empowered');
    expect(haystack).not.toContain('Confident Tax Filers');
  });

  it('keeps simulator options playable and explained', () => {
    for (const scenario of simulator.scenarios) {
      expect(scenario.options.length).toBeGreaterThanOrEqual(2);
      for (const option of scenario.options) {
        expect(option.label.trim().length).toBeGreaterThan(0);
        expect(option.feedback.trim().length).toBeGreaterThan(0);
        expect(Number.isFinite(option.cashDelta)).toBe(true);
        expect(option.smartsDelta).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('keeps level thresholds strictly increasing from zero', () => {
    const sorted = [...levels].sort((a, b) => a.level - b.level);
    expect(sorted[0].minXp).toBe(0);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].minXp).toBeGreaterThan(sorted[i - 1].minXp);
    }
  });

  it('references only real categories from achievement rules', () => {
    const categoryIds = new Set(categories.map((c) => c.id));
    for (const a of achievements) {
      if (a.rule.kind === 'category_complete') {
        expect(categoryIds.has(a.rule.categoryId)).toBe(true);
      }
    }
  });
});
