#!/usr/bin/env node
/**
 * Generates supabase/seed.sql from the bundled TypeScript content.
 *
 * The app ships content bundled (so it works offline on first launch); this script mirrors that
 * same content into the Supabase `content_*` tables so Jacky can edit it there afterwards without
 * shipping a new app build.
 *
 * Usage:  npm run seed:generate
 * Then:   supabase db reset      (or psql -f supabase/seed.sql)
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const mobileRoot = resolve(here, '..');
const outFile = resolve(mobileRoot, '..', 'supabase', 'seed.sql');

// 1. Compile just the content layer to plain JS so Node can import it.
const buildDir = mkdtempSync(join(tmpdir(), 'ti-seed-'));
try {
  execFileSync(
    join(mobileRoot, 'node_modules', '.bin', 'tsc'),
    [
      'src/content/index.ts',
      '--outDir', buildDir,
      // CommonJS output: the TS sources use extensionless relative imports, which Node's ESM
      // loader rejects but its CJS resolver handles fine.
      '--module', 'commonjs',
      '--target', 'es2022',
      '--ignoreDeprecations', '6.0',
      '--moduleResolution', 'node10',
      '--skipLibCheck',
      // TS6 refuses to mix an explicit file list with tsconfig.json unless told to ignore it.
      '--ignoreConfig',
    ],
    { cwd: mobileRoot, stdio: 'inherit' },
  );

  // tsc infers rootDir as src/content, so output lands flat in buildDir.
  writeFileSync(join(buildDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));
  const entry = pathToFileURL(join(buildDir, 'index.js')).href;
  const mod = await import(entry);
  const content = mod.bundledContent;

  writeFileSync(outFile, buildSql(content));
  console.log(`Wrote ${outFile}`);
  console.log(
    `  ${content.categories.length} categories, ${content.lessons.length} lessons, ` +
      `${content.questions.length} questions, ${content.videos.length} videos, ` +
      `${content.faqs.length} FAQs, ${content.simulator.scenarios.length} scenarios`,
  );
} finally {
  rmSync(buildDir, { recursive: true, force: true });
}

/* ------------------------------------------------------------------ SQL helpers */

// Function declarations (not const): these are used by buildSql, which runs above this point
// in module evaluation order, so they must be hoisted.

/** Quotes a SQL string literal. Doubling single quotes is the only escaping Postgres needs. */
function q(value) {
  if (value === null || value === undefined) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}
function jsonb(value) {
  return `${q(JSON.stringify(value ?? null))}::jsonb`;
}
function bool(value) {
  return value ? 'true' : 'false';
}
function num(value) {
  return Number.isFinite(value) ? String(value) : '0';
}

function insert(table, columns, rows, conflictTarget) {
  if (rows.length === 0) return `-- ${table}: nothing to seed\n`;
  const updates = columns
    .filter((c) => c !== conflictTarget)
    .map((c) => `${c} = excluded.${c}`)
    .join(', ');
  const values = rows.map((r) => `  (${r.join(', ')})`).join(',\n');
  return (
    `insert into public.${table} (${columns.join(', ')}) values\n${values}\n` +
    `on conflict (${conflictTarget}) do update set ${updates};\n`
  );
}

function buildSql(content) {
  const out = [];
  out.push('-- TaxIntuitive seed content.');
  out.push('-- GENERATED FILE — do not edit by hand.');
  out.push('-- Regenerate with: cd mobile && npm run seed:generate');
  out.push(`-- Source: mobile/src/content (content version ${content.version})`);
  out.push('--');
  out.push('-- Safe to re-run: every statement upserts.');
  out.push('');
  out.push('begin;');
  out.push('');

  out.push(
    insert(
      'content_categories',
      ['id', 'title', 'blurb', 'emoji', 'track', 'sort_order'],
      content.categories.map((c) => [q(c.id), q(c.title), q(c.blurb), q(c.emoji), q(c.track), num(c.order)]),
      'id',
    ),
  );

  // Lessons before questions/videos: those reference lesson ids.
  out.push(
    insert(
      'content_lessons',
      [
        'id', 'slug', 'title', 'category_id', 'kind', 'summary', 'reading_minutes', 'body',
        'key_takeaways', 'official_sources', 'last_reviewed', 'needs_verification',
        'related_video_id', 'related_quiz_id', 'xp', 'sort_order', 'featured', 'published',
      ],
      content.lessons.map((l) => [
        q(l.id), q(l.slug), q(l.title), q(l.categoryId), q(l.kind), q(l.summary),
        num(l.readingMinutes), jsonb(l.body), jsonb(l.keyTakeaways), jsonb(l.officialSources),
        q(l.lastReviewed), bool(l.needsVerification),
        // FK targets are added later in this transaction, so leave them null on first insert
        // and patch them once every row exists.
        'null', 'null',
        num(l.xp), num(l.order), bool(l.featured), 'true',
      ]),
      'id',
    ),
  );

  out.push(
    insert(
      'content_quizzes',
      [
        'id', 'slug', 'title', 'description', 'emoji', 'kind', 'category_id', 'question_ids',
        'featured_from', 'xp_per_correct', 'sort_order', 'published',
      ],
      content.quizzes.map((z) => [
        q(z.id), q(z.slug), q(z.title), q(z.description), q(z.emoji), q(z.kind),
        z.categoryId ? q(z.categoryId) : 'null',
        z.questionIds ? jsonb(z.questionIds) : 'null',
        z.featuredFrom ? q(z.featuredFrom) : 'null',
        num(z.xpPerCorrect), num(z.order), 'true',
      ]),
      'id',
    ),
  );

  out.push(
    insert(
      'content_questions',
      ['id', 'category_id', 'prompt', 'options', 'answer_index', 'explanation', 'teaches_lesson_id', 'difficulty', 'published'],
      content.questions.map((x) => [
        q(x.id), q(x.categoryId), q(x.prompt), jsonb(x.options), num(x.answerIndex),
        q(x.explanation), x.teachesLessonId ? q(x.teachesLessonId) : 'null', q(x.difficulty), 'true',
      ]),
      'id',
    ),
  );

  out.push(
    insert(
      'content_videos',
      [
        'id', 'title', 'question', 'description', 'category', 'youtube_id', 'duration_seconds',
        'transcript', 'captions_available', 'related_lesson_id', 'related_quiz_id', 'featured',
        'xp', 'sort_order', 'published',
      ],
      content.videos.map((v) => [
        q(v.id), q(v.title), q(v.question), q(v.description), q(v.category), q(v.youtubeId),
        v.durationSeconds ? num(v.durationSeconds) : 'null',
        v.transcript ? q(v.transcript) : 'null',
        bool(v.captionsAvailable),
        v.relatedLessonId ? q(v.relatedLessonId) : 'null',
        v.relatedQuizId ? q(v.relatedQuizId) : 'null',
        bool(v.featured), num(v.xp), num(v.order), 'true',
      ]),
      'id',
    ),
  );

  // Now that quizzes and videos exist, patch the lesson FKs.
  const lessonLinks = content.lessons.filter((l) => l.relatedQuizId || l.relatedVideoId);
  if (lessonLinks.length) {
    out.push('-- link lessons to their related quiz/video (FK targets now exist)');
    for (const l of lessonLinks) {
      out.push(
        `update public.content_lessons set related_quiz_id = ${
          l.relatedQuizId ? q(l.relatedQuizId) : 'null'
        }, related_video_id = ${
          l.relatedVideoId ? q(l.relatedVideoId) : 'null'
        } where id = ${q(l.id)};`,
      );
    }
    out.push('');
  }

  out.push(
    insert(
      'content_glossary',
      ['term', 'definition', 'category_id'],
      content.glossary.map((g) => [q(g.term), q(g.definition), g.categoryId ? q(g.categoryId) : 'null']),
      'term',
    ),
  );

  out.push(
    insert(
      'content_faqs',
      ['id', 'question', 'answer', 'sort_order', 'published'],
      content.faqs.map((f) => [q(f.id), q(f.question), q(f.answer), num(f.order), 'true']),
      'id',
    ),
  );

  out.push(
    insert(
      'content_simulator_scenarios',
      ['id', 'month_label', 'prompt', 'category_id', 'options', 'sort_order', 'published'],
      content.simulator.scenarios.map((s) => [
        q(s.id), q(s.monthLabel), q(s.prompt), s.categoryId ? q(s.categoryId) : 'null',
        jsonb(s.options), num(s.order), 'true',
      ]),
      'id',
    ),
  );

  out.push(
    insert(
      'content_achievements',
      ['id', 'title', 'description', 'emoji', 'tier', 'rule', 'sort_order'],
      content.achievements.map((a) => [
        q(a.id), q(a.title), q(a.description), q(a.emoji), q(a.tier), jsonb(a.rule), num(a.order),
      ]),
      'id',
    ),
  );

  // Workshops are intentionally not seeded: the live site has no published sessions, and the app
  // shows a "coming soon" state rather than inventing events.
  out.push('-- content_workshops: intentionally empty (no published sessions yet)');
  out.push('');
  out.push('commit;');
  out.push('');
  return out.join('\n');
}
