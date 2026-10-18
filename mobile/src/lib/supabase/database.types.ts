/**
 * Supabase schema types, matching /supabase/migrations.
 *
 * Hand-written so the repo typechecks without a running database. Once you have a project,
 * regenerate with:
 *   npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

interface Table<Row, Insert = Partial<Row>, Update = Partial<Row>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  leaderboard_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface XpEventRow {
  id: string;
  user_id: string;
  reason: string;
  xp: number;
  track_id: string;
  ref_id: string | null;
  created_at: string;
}

export interface LessonProgressRow {
  user_id: string;
  lesson_id: string;
  opened: boolean;
  completed: boolean;
  completed_at: string | null;
  bookmarked: boolean;
  scroll_progress: number;
  last_opened_at: string;
}

export interface QuizAttemptRow {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total: number;
  wrong_question_ids: Json;
  created_at: string;
}

export interface VideoProgressRow {
  user_id: string;
  video_id: string;
  position_seconds: number;
  completed: boolean;
  last_watched_at: string;
}

export interface SimulatorRunRow {
  id: string;
  user_id: string;
  final_cash: number;
  final_savings: number;
  final_debt: number;
  money_smarts: number;
  max_money_smarts: number;
  tier: 'broke' | 'bronze' | 'silver' | 'gold';
  lessons: Json;
  created_at: string;
}

export interface AchievementEarnedRow {
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface ActiveDayRow {
  user_id: string;
  day: string;
}

export interface WorkshopRequestRow {
  id: string;
  user_id: string | null;
  contact_name: string;
  contact_email: string;
  organization: string | null;
  preferred_date: string | null;
  message: string;
  created_at: string;
}

export interface ContactMessageRow {
  id: string;
  user_id: string | null;
  contact_email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

export interface DuoMatchRow {
  id: string;
  room_code: string;
  host_id: string;
  guest_id: string | null;
  status: 'waiting' | 'ready' | 'active' | 'finished' | 'abandoned' | 'expired';
  question_ids: Json;
  current_index: number;
  seconds_per_question: number;
  question_started_at: string | null;
  winner_id: string | null;
  is_tie: boolean;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  expires_at: string;
}

export interface DuoParticipantRow {
  match_id: string;
  user_id: string;
  display_name: string;
  role: 'host' | 'guest';
  ready: boolean;
  score: number;
  correct_count: number;
  streak: number;
  last_seen_at: string;
  joined_at: string;
}

export interface DuoAnswerRow {
  id: string;
  match_id: string;
  user_id: string;
  question_index: number;
  question_id: string;
  chosen_index: number | null;
  is_correct: boolean;
  answered_ms: number;
  awarded_points: number;
  created_at: string;
}

/* ------------------------------------------------------------------- content rows */

export interface ContentCategoryRow {
  id: string;
  title: string;
  blurb: string;
  emoji: string;
  track: string;
  sort_order: number;
  updated_at: string;
}

export interface ContentLessonRow {
  id: string;
  slug: string;
  title: string;
  category_id: string;
  kind: 'lesson' | 'guide';
  summary: string;
  reading_minutes: number;
  body: Json;
  key_takeaways: Json;
  official_sources: Json;
  last_reviewed: string;
  needs_verification: boolean;
  related_video_id: string | null;
  related_quiz_id: string | null;
  xp: number;
  sort_order: number;
  featured: boolean;
  published: boolean;
  updated_at: string;
}

export interface ContentQuizRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  kind: 'topic' | 'weekly' | 'challenge';
  category_id: string | null;
  question_ids: Json | null;
  featured_from: string | null;
  xp_per_correct: number;
  sort_order: number;
  published: boolean;
  updated_at: string;
}

export interface ContentQuestionRow {
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  id: string;
  category_id: string;
  prompt: string;
  options: Json;
  answer_index: number;
  explanation: string;
  teaches_lesson_id: string | null;
  published: boolean;
  updated_at: string;
}

export interface ContentVideoRow {
  id: string;
  title: string;
  question: string;
  description: string;
  category: string;
  youtube_id: string;
  duration_seconds: number | null;
  transcript: string | null;
  captions_available: boolean;
  related_lesson_id: string | null;
  related_quiz_id: string | null;
  featured: boolean;
  xp: number;
  sort_order: number;
  published: boolean;
  updated_at: string;
}

export interface ContentGlossaryRow {
  term: string;
  definition: string;
  category_id: string | null;
  updated_at: string;
}

export interface ContentFaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
  updated_at: string;
}

export interface ContentWorkshopRow {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  location_name: string | null;
  address: string | null;
  online: boolean;
  registration_url: string | null;
  status: 'upcoming' | 'past' | 'cancelled';
  audience: string | null;
  published: boolean;
  updated_at: string;
}

export interface ContentSimulatorScenarioRow {
  id: string;
  month_label: string;
  prompt: string;
  category_id: string | null;
  options: Json;
  sort_order: number;
  published: boolean;
  updated_at: string;
}

export interface ContentAchievementRow {
  id: string;
  title: string;
  description: string;
  emoji: string;
  tier: 'bronze' | 'silver' | 'gold';
  rule: Json;
  sort_order: number;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      xp_events: Table<XpEventRow>;
      lesson_progress: Table<LessonProgressRow>;
      quiz_attempts: Table<QuizAttemptRow>;
      video_progress: Table<VideoProgressRow>;
      simulator_runs: Table<SimulatorRunRow>;
      achievements_earned: Table<AchievementEarnedRow>;
      active_days: Table<ActiveDayRow>;
      workshop_requests: Table<WorkshopRequestRow>;
      contact_messages: Table<ContactMessageRow>;
      duo_matches: Table<DuoMatchRow>;
      duo_participants: Table<DuoParticipantRow>;
      duo_answers: Table<DuoAnswerRow>;
      content_categories: Table<ContentCategoryRow>;
      content_lessons: Table<ContentLessonRow>;
      content_quizzes: Table<ContentQuizRow>;
      content_questions: Table<ContentQuestionRow>;
      content_videos: Table<ContentVideoRow>;
      content_glossary: Table<ContentGlossaryRow>;
      content_faqs: Table<ContentFaqRow>;
      content_workshops: Table<ContentWorkshopRow>;
      content_simulator_scenarios: Table<ContentSimulatorScenarioRow>;
      content_achievements: Table<ContentAchievementRow>;
      content_editors: Table<{ user_id: string; created_at: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
