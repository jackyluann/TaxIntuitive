import type { Video } from './types';

/**
 * "Ask a Tax Expert" video library, migrated from the website's Learning Hub / video series.
 *
 * `youtubeId: ''` means the episode is planned but not filmed yet — the player shows a
 * "coming soon" state instead of a broken embed. Fill in the YouTube id (the part after `v=`)
 * to publish an episode; no screen code changes needed.
 */
export const videos: Video[] = [
  {
    id: 'video-first-paycheque',
    title: 'Your first paycheque, decoded',
    question: 'You got your first job at $18/hour — how much are you actually taking home?',
    description:
      'The classic first-paycheque shock. We break a real pay stub down from gross pay to the amount that actually lands in your account.',
    category: 'Your Paycheque',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-paycheque-gross-vs-net',
    relatedQuizId: 'quiz-your-paycheque',
    featured: true,
    xp: 10,
    order: 1,
  },
  {
    id: 'video-what-is-income-tax',
    title: 'What is income tax, really?',
    question: 'What is income tax, really?',
    description:
      'What income tax is, who collects it (hello, CRA), and why a slice of what you earn goes to it.',
    category: 'Your Paycheque',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-tax-basics-what-are-taxes',
    relatedQuizId: 'quiz-tax-basics',
    xp: 10,
    order: 2,
  },
  {
    id: 'video-what-is-cpp',
    title: 'What is CPP?',
    question: 'What is CPP, and why is it on my pay stub?',
    description:
      'The Canada Pension Plan explained — what it is, why it is deducted, and what you get for it later.',
    category: 'Your Paycheque',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-paycheque-gross-vs-net',
    xp: 10,
    order: 3,
  },
  {
    id: 'video-what-is-ei',
    title: 'What is EI?',
    question: 'What is EI?',
    description:
      'Employment Insurance in plain terms: what the deduction is for and when it can help you.',
    category: 'Your Paycheque',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-paycheque-gross-vs-net',
    xp: 10,
    order: 4,
  },
  {
    id: 'video-why-pay-smaller',
    title: 'Why is my paycheque smaller than I expected?',
    question: 'Why is my paycheque smaller than I expected?',
    description:
      'We add up every deduction — tax, CPP, EI — so the gap between your hourly rate and your take-home finally makes sense.',
    category: 'Your Paycheque',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-paycheque-gross-vs-net',
    relatedQuizId: 'quiz-your-paycheque',
    xp: 10,
    order: 5,
  },
  {
    id: 'video-what-is-a-t4',
    title: 'What is a T4?',
    question: 'What is a T4?',
    description:
      'The slip your employer gives you at tax time, what is on it, and why you need it to file.',
    category: 'Forms & Slips',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'guide-what-is-a-t4',
    relatedQuizId: 'quiz-slips',
    xp: 10,
    order: 6,
  },
  {
    id: 'video-what-is-td1',
    title: 'What is a TD1 form?',
    question: 'What is a TD1 form, and why does my employer want it?',
    description:
      'The form you fill out when you are hired — and how getting it right affects how much tax comes off your pay.',
    category: 'Forms & Slips',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-td1',
    relatedQuizId: 'quiz-slips',
    xp: 10,
    order: 7,
  },
  {
    id: 'video-tax-brackets',
    title: 'How do tax brackets actually work?',
    question: 'How do tax brackets actually work?',
    description:
      'The biggest tax myth, busted: moving into a higher bracket does NOT mean every dollar you earn is taxed more.',
    category: 'Filing',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'guide-tax-brackets',
    relatedQuizId: 'quiz-tax-basics',
    featured: true,
    xp: 15,
    order: 8,
  },
  {
    id: 'video-when-must-i-file',
    title: 'When do I have to file a tax return?',
    question: 'When do I have to file a tax return?',
    description:
      'Who needs to file, the April 30 deadline, and why filing is worth it even when you do not owe.',
    category: 'Filing',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'guide-file-first-return',
    relatedQuizId: 'quiz-deadlines',
    xp: 15,
    order: 9,
  },
  {
    id: 'video-what-if-i-dont-file',
    title: "What happens if I don't file?",
    question: "What happens if I don't file?",
    description:
      'Late penalties, lost benefits, and how a missed return can quietly cost you money.',
    category: 'Filing',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-deadlines',
    relatedQuizId: 'quiz-deadlines',
    xp: 15,
    order: 10,
  },
  {
    id: 'video-what-is-a-refund',
    title: 'What is a tax refund?',
    question: 'What is a tax refund?',
    description:
      "Why a refund isn't free money — it's your own overpaid tax coming back to you.",
    category: 'Filing',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-tax-basics-what-are-taxes',
    relatedQuizId: 'quiz-tax-basics',
    xp: 10,
    order: 11,
  },
  {
    id: 'video-tfsa-vs-rrsp',
    title: 'TFSA vs RRSP',
    question: "TFSA vs RRSP — what's the difference?",
    description:
      'Two accounts, opposite superpowers. Which one makes sense when you are just starting out.',
    category: 'Saving & Growing',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-tfsa-vs-rrsp',
    relatedQuizId: 'quiz-saving',
    featured: true,
    xp: 15,
    order: 12,
  },
  {
    id: 'video-how-gst-hst-works',
    title: 'How does GST/HST work?',
    question: 'How does GST/HST work?',
    description:
      'The sales tax you pay on almost everything — and the tax-free credit that can put some of it back in your pocket.',
    category: 'Everyday Money',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-credits-benefits',
    relatedQuizId: 'quiz-benefits',
    xp: 15,
    order: 13,
  },
  {
    id: 'video-moving-out',
    title: 'Moving out and taxes',
    question: 'What happens (tax-wise) when I move out?',
    description:
      'Independence and taxes: what changes on your return once you are on your own.',
    category: 'Life Events',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-tax-basics-what-are-taxes',
    xp: 10,
    order: 14,
  },
  {
    id: 'video-going-freelance',
    title: 'Going freelance or self-employed',
    question: 'Going freelance or self-employed — what changes?',
    description:
      'No employer taking tax off for you: what you now track, save for, and can deduct.',
    category: 'Life Events',
    youtubeId: '',
    captionsAvailable: false,
    relatedLessonId: 'lesson-gig-income',
    relatedQuizId: 'quiz-tax-basics',
    xp: 15,
    order: 15,
  },
];

export const videoById = (id: string) => videos.find((v) => v.id === id);
export const publishedVideos = () => videos.filter((v) => v.youtubeId.trim().length > 0);
export const videoCategories = () => Array.from(new Set(videos.map((v) => v.category)));
