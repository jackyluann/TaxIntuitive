import type { LessonCategory, XpTrack, LevelDef } from './types';

/**
 * Learning Hub categories. Derived from the TaxIntuitive site's "Learn the Basics" guide
 * (parts 1-7) plus the personal-finance areas the XP Tracker already measured.
 */
export const categories: LessonCategory[] = [
  {
    id: 'tax-basics',
    title: 'Tax Basics',
    blurb: 'What taxes are, who files, and how refunds work.',
    emoji: '🧾',
    track: 'taxes',
    order: 1,
  },
  {
    id: 'your-paycheque',
    title: 'Your Paycheque',
    blurb: 'Why your pay is smaller than you expected.',
    emoji: '💵',
    track: 'taxes',
    order: 2,
  },
  {
    id: 'slips-and-documents',
    title: 'Tax Slips & Documents',
    blurb: 'T4, T4A, T5, T2202 and the TD1 you fill in yourself.',
    emoji: '📄',
    track: 'taxes',
    order: 3,
  },
  {
    id: 'first-tax-return',
    title: 'Filing Your First Return',
    blurb: 'Step by step, start to submitted.',
    emoji: '🚀',
    track: 'taxes',
    order: 4,
  },
  {
    id: 'deadlines-and-penalties',
    title: 'Deadlines & Penalties',
    blurb: 'When to file and what late filing costs.',
    emoji: '⏰',
    track: 'taxes',
    order: 5,
  },
  {
    id: 'credits-and-benefits',
    title: 'Credits & Benefits',
    blurb: 'Money that can come back to you.',
    emoji: '🎁',
    track: 'taxes',
    order: 6,
  },
  {
    id: 'employment-and-gig-income',
    title: 'Employment & Gig Income',
    blurb: 'Tips, side gigs and self-employment.',
    emoji: '🛴',
    track: 'taxes',
    order: 7,
  },
  {
    id: 'saving-and-investing',
    title: 'Saving & Investing',
    blurb: 'Emergency funds and letting money grow.',
    emoji: '🌱',
    track: 'saving',
    order: 8,
  },
  {
    id: 'tfsa-and-rrsp',
    title: 'TFSA & RRSP',
    blurb: 'Two accounts with opposite superpowers.',
    emoji: '🏦',
    track: 'investing',
    order: 9,
  },
  {
    id: 'banking-and-credit',
    title: 'Banking & Credit',
    blurb: 'Accounts, credit cards, interest and scores.',
    emoji: '💳',
    track: 'credit',
    order: 10,
  },
  {
    id: 'tax-glossary',
    title: 'Tax Glossary',
    blurb: 'Every term in one place.',
    emoji: '📖',
    track: 'taxes',
    order: 11,
  },
];

/** XP tracks shown on the XP Tracker. Mirrors the website's four-track tracker, plus saving. */
export const tracks: XpTrack[] = [
  { id: 'taxes', title: 'Taxes', colorToken: 'taxes', order: 1 },
  { id: 'banking', title: 'Banking', colorToken: 'banking', order: 2 },
  { id: 'credit', title: 'Credit', colorToken: 'credit', order: 3 },
  { id: 'saving', title: 'Saving', colorToken: 'saving', order: 4 },
  { id: 'investing', title: 'Investing', colorToken: 'investing', order: 5 },
];

/**
 * Levels are thresholds over real earned XP — never a hard-coded percentage.
 * Titles keep the site's "novice to pro" framing.
 */
export const levels: LevelDef[] = [
  { level: 1, title: 'Getting Started', minXp: 0 },
  { level: 2, title: 'Curious Beginner', minXp: 50 },
  { level: 3, title: 'Paycheque Reader', minXp: 125 },
  { level: 4, title: 'Slip Sorter', minXp: 225 },
  { level: 5, title: 'First-Time Filer', minXp: 350 },
  { level: 6, title: 'Benefit Hunter', minXp: 500 },
  { level: 7, title: 'Money Smart', minXp: 700 },
  { level: 8, title: 'Tax Confident', minXp: 950 },
  { level: 9, title: 'Financially Literate', minXp: 1250 },
  { level: 10, title: 'TaxIntuitive Pro', minXp: 1600 },
];

export const categoryById = (id: string) => categories.find((c) => c.id === id);
