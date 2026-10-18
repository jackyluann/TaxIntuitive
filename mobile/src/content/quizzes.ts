import { moduleQuizzes, moduleQuestions } from './module-pack';
import type { Quiz, QuizQuestion } from './types';

/**
 * Question bank migrated from the website's "Tax Trivia & Quizzes" page.
 * Sourced from Canada Revenue Agency public information; every question carries a
 * plain-language explanation and points at the lesson that teaches it.
 */
export const questions: QuizQuestion[] = [
  ...moduleQuestions,
  /* ------------------------------------------------------------------ tax basics */
  {
    id: 'q-basics-1',
    categoryId: 'tax-basics',
    prompt: 'Which government agency administers income taxes in Canada?',
    options: [
      'Canada Revenue Agency (CRA)',
      'Service Canada',
      'The Bank of Canada',
      'Statistics Canada',
    ],
    answerIndex: 0,
    explanation:
      'The CRA collects taxes and pays out most benefits and credits. (In Quebec, Revenu Québec also handles the provincial return.)',
    teachesLessonId: 'lesson-tax-basics-what-are-taxes',
  },
  {
    id: 'q-basics-2',
    categoryId: 'tax-basics',
    prompt: 'What do you need before you can file a Canadian tax return?',
    options: ['A passport', 'A Social Insurance Number (SIN)', "A driver's licence", 'A credit card'],
    answerIndex: 1,
    explanation:
      "Your SIN is the number the CRA uses to identify you. You can't file without one.",
    teachesLessonId: 'lesson-tax-basics-what-are-taxes',
  },
  {
    id: 'q-basics-3',
    categoryId: 'tax-basics',
    prompt: 'Should you file a tax return even if you earned little or no income?',
    options: [
      "No, it's a waste of time",
      'Only if you owe money',
      'Yes — filing is how you get benefits and credits',
      'Only after you turn 25',
    ],
    answerIndex: 2,
    explanation:
      "Filing is required to keep receiving benefit and credit payments you're entitled to — even with $0 income.",
    teachesLessonId: 'guide-do-i-need-to-file',
  },
  {
    id: 'q-basics-4',
    categoryId: 'tax-basics',
    prompt: 'A tax refund happens when…',
    options: [
      'The government gives everyone free money',
      'You paid more tax during the year than you actually owed',
      'You skip filing',
      'You earn over $100,000',
    ],
    answerIndex: 1,
    explanation:
      'A refund is your own overpaid tax coming back to you — for example, if too much was taken off your paycheques.',
    teachesLessonId: 'lesson-tax-basics-what-are-taxes',
  },
  {
    id: 'q-basics-5',
    categoryId: 'tax-basics',
    prompt: 'You drive for a food-delivery app on weekends. Do you have to report that income?',
    options: [
      'No, gig work is tax-free',
      'Only if they mail you a slip',
      'Yes — all income must be reported, even without a slip',
      'Only if you make over $30,000',
    ],
    answerIndex: 2,
    explanation:
      'Tips, gig work and self-employed earnings must all be reported, even when no slip is issued.',
    teachesLessonId: 'lesson-gig-income',
  },

  /* ----------------------------------------------------------------------- slips */
  {
    id: 'q-slips-1',
    categoryId: 'slips-and-documents',
    prompt: 'Which slip shows the employment income you earned at a job?',
    options: ['T4', 'T5', 'T2202', 'T4A'],
    answerIndex: 0,
    explanation:
      'A T4 reports your employment income and the tax already withheld by your employer.',
    teachesLessonId: 'guide-what-is-a-t4',
  },
  {
    id: 'q-slips-2',
    categoryId: 'slips-and-documents',
    prompt:
      'Which slip commonly reports scholarships, bursaries, or certain self-employment or pension income?',
    options: ['T4', 'T5', 'T4A', 'T1'],
    answerIndex: 2,
    explanation:
      'A T4A covers income like scholarships, RESP payments, pensions, and some self-employment fees.',
    teachesLessonId: 'lesson-slips-overview',
  },
  {
    id: 'q-slips-3',
    categoryId: 'slips-and-documents',
    prompt: 'Which slip reports interest income, such as interest from a savings account?',
    options: ['T2202', 'T5', 'T4', 'T4A'],
    answerIndex: 1,
    explanation: 'A T5 reports investment income like interest and dividends.',
    teachesLessonId: 'lesson-slips-overview',
  },
  {
    id: 'q-slips-4',
    categoryId: 'slips-and-documents',
    prompt: 'As a post-secondary student, which certificate reports your eligible tuition?',
    options: ['T4', 'T2202', 'T5', 'T1 General'],
    answerIndex: 1,
    explanation:
      'The T2202 shows eligible tuition and months of study. You can claim it or carry it forward.',
    teachesLessonId: 'lesson-slips-overview',
  },
  {
    id: 'q-slips-5',
    categoryId: 'slips-and-documents',
    prompt: 'If you paid tuition as a student, that amount can generally be…',
    options: [
      'Ignored on your taxes',
      'Claimed on your return, or carried forward/transferred',
      'Only used for a loan',
      'Turned into cash immediately',
    ],
    answerIndex: 1,
    explanation:
      'Tuition credits can lower your tax, be carried forward to a future year, or (in some cases) transferred to a parent or grandparent.',
    teachesLessonId: 'lesson-slips-overview',
  },
  {
    id: 'q-slips-6',
    categoryId: 'slips-and-documents',
    prompt: 'What is a TD1 form for?',
    options: [
      'Reporting your tips to the CRA',
      'Telling your employer how much tax to take off your pay',
      'Claiming a refund directly',
      'Opening a TFSA',
    ],
    answerIndex: 1,
    explanation:
      'You fill in a TD1 when you start a job. It sets how much tax your employer withholds from each paycheque.',
    teachesLessonId: 'lesson-td1',
  },

  /* ----------------------------------------------------------- your paycheque */
  {
    id: 'q-pay-1',
    categoryId: 'your-paycheque',
    prompt: 'What is the difference between gross pay and net pay?',
    options: [
      'They are the same thing',
      'Gross is what you earn; net is what actually reaches your account',
      'Net is before deductions; gross is after',
      'Gross applies only to salaried jobs',
    ],
    answerIndex: 1,
    explanation:
      'Gross pay is your full earnings. Net (take-home) pay is what lands in your bank after deductions.',
    teachesLessonId: 'lesson-paycheque-gross-vs-net',
  },
  {
    id: 'q-pay-2',
    categoryId: 'your-paycheque',
    prompt: 'What does CPP stand for on your pay stub?',
    options: [
      'Canada Payroll Plan',
      'Canada Pension Plan',
      'Certified Payment Program',
      'Consumer Price Protection',
    ],
    answerIndex: 1,
    explanation:
      'CPP is the Canada Pension Plan — money set aside toward income when you retire.',
    teachesLessonId: 'lesson-paycheque-gross-vs-net',
  },
  {
    id: 'q-pay-3',
    categoryId: 'your-paycheque',
    prompt: 'What is EI for?',
    options: [
      'Extra investment income',
      'Support if you lose your job',
      'Employer insurance for workplace tools',
      'A savings account bonus',
    ],
    answerIndex: 1,
    explanation:
      'EI is Employment Insurance. It can provide some income if you lose your job.',
    teachesLessonId: 'lesson-paycheque-gross-vs-net',
  },
  {
    id: 'q-pay-4',
    categoryId: 'your-paycheque',
    prompt: 'Your first paycheque is smaller than hours × wage. The most likely reason is…',
    options: [
      'Your employer made an error',
      'Income tax, CPP and EI were deducted',
      'The bank took a fee',
      'You were paid for fewer hours on purpose',
    ],
    answerIndex: 1,
    explanation:
      'Payroll deductions — income tax, CPP and EI — are normal and explain the gap. It is not an employer mistake.',
    teachesLessonId: 'lesson-paycheque-gross-vs-net',
  },

  /* ------------------------------------------------------------------ deadlines */
  {
    id: 'q-dead-1',
    categoryId: 'deadlines-and-penalties',
    prompt:
      "What's the general deadline to file your personal tax return and pay any balance owing?",
    options: ['December 31', 'April 30', 'January 1', 'June 30'],
    answerIndex: 1,
    explanation:
      'For most people the filing and payment deadline is April 30. Dates shift if that falls on a weekend — check canada.ca.',
    teachesLessonId: 'lesson-deadlines',
  },
  {
    id: 'q-dead-2',
    categoryId: 'deadlines-and-penalties',
    prompt: 'If you (or your spouse) are self-employed, your filing deadline is…',
    options: [
      'April 30',
      'June 15 (but any tax owing is still due April 30)',
      'December 31',
      "There's no deadline",
    ],
    answerIndex: 1,
    explanation:
      'Self-employed people have until June 15 to file, but any balance owing is still due by April 30.',
    teachesLessonId: 'lesson-deadlines',
  },
  {
    id: 'q-dead-3',
    categoryId: 'deadlines-and-penalties',
    prompt: "What is the CRA's late-filing penalty if you owe money and file late?",
    options: [
      'A flat $50',
      'Nothing, ever',
      '5% of the balance owing, plus 1% for each full month late',
      'Half of your refund',
    ],
    answerIndex: 2,
    explanation:
      'The penalty is 5% of your balance owing plus 1% for each full month your return is late (up to 12 months). Verify current rules on canada.ca.',
    teachesLessonId: 'lesson-deadlines',
  },
  {
    id: 'q-dead-4',
    categoryId: 'deadlines-and-penalties',
    prompt:
      'The CRA service that lets you file your return online through certified software is called…',
    options: ['e-Transfer', 'NETFILE', 'AutoPay', 'MyCRA Wallet'],
    answerIndex: 1,
    explanation:
      'NETFILE sends your return to the CRA using certified tax software — the fastest way to file.',
    teachesLessonId: 'lesson-deadlines',
  },
  {
    id: 'q-dead-5',
    categoryId: 'deadlines-and-penalties',
    prompt: 'When you file electronically, refunds are typically issued in about…',
    options: ['2 weeks', '6 months', '1 day', '1 year'],
    answerIndex: 0,
    explanation:
      'Filing online with direct deposit usually gets your refund to you in around two weeks.',
    teachesLessonId: 'lesson-deadlines',
  },
  {
    id: 'q-dead-6',
    categoryId: 'deadlines-and-penalties',
    prompt: 'If you cannot pay what you owe by the deadline, you should…',
    options: [
      'Skip filing until you can pay',
      'File on time anyway, then deal with the balance',
      'Wait for the CRA to contact you',
      'File next year instead',
    ],
    answerIndex: 1,
    explanation:
      'Always file on time even if you cannot pay. The late-filing penalty is charged on top of interest, so filing late costs more.',
    teachesLessonId: 'lesson-deadlines',
  },

  /* ------------------------------------------------------------------- benefits */
  {
    id: 'q-ben-1',
    categoryId: 'credits-and-benefits',
    prompt: 'To qualify for the CGEB (formerly GST/HST credit) on your own, you generally must be at least…',
    options: ['16', '18', '19', '25'],
    answerIndex: 2,
    explanation:
      'You generally need to be 19 or older to get the CGEB (formerly GST/HST credit) on your own (younger people can qualify if they are a parent or have a spouse/partner).',
    teachesLessonId: 'lesson-credits-benefits',
  },
  {
    id: 'q-ben-2',
    categoryId: 'credits-and-benefits',
    prompt: 'How do you receive the CGEB (formerly GST/HST credit) and related benefits?',
    options: [
      'Apply at a bank',
      "By filing your tax return — it's assessed automatically",
      'Call your employer',
      "You can't get it under 30",
    ],
    answerIndex: 1,
    explanation:
      'Just file your return. The CRA works out your eligibility automatically from it.',
    teachesLessonId: 'lesson-credits-benefits',
  },
  {
    id: 'q-ben-3',
    categoryId: 'credits-and-benefits',
    prompt: 'Is the CGEB (formerly GST/HST credit) considered taxable income?',
    options: [
      'Yes, you pay tax on it',
      "No — it's tax-free",
      'Only half of it',
      "Only if you're employed",
    ],
    answerIndex: 1,
    explanation:
      'The CGEB (formerly GST/HST credit) is a tax-free payment meant to offset sales tax for lower-income people.',
    teachesLessonId: 'lesson-credits-benefits',
  },
  {
    id: 'q-ben-4',
    categoryId: 'credits-and-benefits',
    prompt: 'Filing your taxes matters mainly because…',
    options: [
      "It's fun",
      'Your benefit and credit payments are calculated from your return',
      'It raises your credit score',
      'It cancels your student loans',
    ],
    answerIndex: 1,
    explanation:
      'Payments like the CGEB (formerly GST/HST credit) and Canada Child Benefit are based on the info in your return — no return, no payments.',
    teachesLessonId: 'lesson-credits-benefits',
  },
  {
    id: 'q-ben-5',
    categoryId: 'credits-and-benefits',
    prompt:
      'Where can people with modest income and a simple tax situation get free help filing?',
    options: [
      'Nowhere — it always costs money',
      'CRA free volunteer tax clinics (CVITP)',
      'Only from a bank',
      'Only from a lawyer',
    ],
    answerIndex: 1,
    explanation:
      'Free volunteer tax clinics help people with modest incomes and simple returns file at no cost.',
    teachesLessonId: 'lesson-deadlines',
  },
  {
    id: 'q-ben-6',
    categoryId: 'credits-and-benefits',
    prompt: 'What is the difference between a deduction and a credit?',
    options: [
      'They are the same',
      'A deduction lowers taxable income; a credit lowers the tax itself',
      'A credit lowers income; a deduction lowers tax',
      'Only businesses get deductions',
    ],
    answerIndex: 1,
    explanation:
      'Deductions come off your income before tax is calculated. Credits reduce the tax amount after it is calculated.',
    teachesLessonId: 'guide-deductions-vs-credits',
  },

  /* --------------------------------------------------------------------- saving */
  {
    id: 'q-save-1',
    categoryId: 'tfsa-and-rrsp',
    prompt: "What's the minimum age to open a TFSA (Tax-Free Savings Account)?",
    options: ['16', '18', '21', '25'],
    answerIndex: 1,
    explanation:
      'You can open a TFSA once you are 18 and have a valid SIN (some provinces require 19 to enter the contract, but room starts building at 18).',
    teachesLessonId: 'lesson-tfsa-vs-rrsp',
  },
  {
    id: 'q-save-2',
    categoryId: 'tfsa-and-rrsp',
    prompt: 'Are withdrawals from a TFSA taxed?',
    options: [
      'Yes, like regular income',
      'No — TFSA withdrawals are tax-free',
      'Only if over $1,000',
      'Only before age 65',
    ],
    answerIndex: 1,
    explanation:
      "Money you take out of a TFSA is tax-free and doesn't affect your federal benefits.",
    teachesLessonId: 'lesson-tfsa-vs-rrsp',
  },
  {
    id: 'q-save-3',
    categoryId: 'tfsa-and-rrsp',
    prompt: 'Are contributions to a TFSA tax-deductible?',
    options: [
      'Yes, they lower your taxable income',
      'No — TFSA contributions are not tax-deductible',
      'Only the first $1,000',
      'Only for students',
    ],
    answerIndex: 1,
    explanation:
      'Unlike an RRSP, TFSA contributions do NOT reduce your taxable income — the perk is tax-free growth and withdrawals.',
    teachesLessonId: 'lesson-tfsa-vs-rrsp',
  },
  {
    id: 'q-save-4',
    categoryId: 'tfsa-and-rrsp',
    prompt: 'After you withdraw money from a TFSA, your contribution room…',
    options: [
      'Is gone forever',
      'Comes back the following calendar year',
      'Doubles instantly',
      'Only returns at age 71',
    ],
    answerIndex: 1,
    explanation:
      'Withdrawn amounts are added back to your contribution room, but not until the next calendar year.',
    teachesLessonId: 'lesson-tfsa-vs-rrsp',
  },
  {
    id: 'q-save-5',
    categoryId: 'tfsa-and-rrsp',
    prompt: 'RRSP (Registered Retirement Savings Plan) contributions are…',
    options: [
      'Tax-deductible — they reduce your taxable income',
      'Never useful',
      'Taxed twice',
      'Only for people over 60',
    ],
    answerIndex: 0,
    explanation:
      'RRSP contributions are deductible, so they can lower the tax you owe for that year.',
    teachesLessonId: 'lesson-tfsa-vs-rrsp',
  },
  {
    id: 'q-save-6',
    categoryId: 'tfsa-and-rrsp',
    prompt: 'When you withdraw money from an RRSP (for example, in retirement), it is…',
    options: ['Tax-free', 'Taxed as income', 'Illegal', 'Matched by the government'],
    answerIndex: 1,
    explanation:
      'RRSP withdrawals are taxed as income — you defer the tax until you take the money out, ideally when your income is lower.',
    teachesLessonId: 'lesson-tfsa-vs-rrsp',
  },
  {
    id: 'q-save-7',
    categoryId: 'tfsa-and-rrsp',
    prompt: 'Which account gives you an immediate tax deduction when you contribute?',
    options: ['TFSA', 'RRSP', 'A chequing account', 'Neither'],
    answerIndex: 1,
    explanation:
      "The RRSP gives an upfront deduction; the TFSA's advantage is tax-free withdrawals later. Which is 'better' depends on your situation.",
    teachesLessonId: 'lesson-tfsa-vs-rrsp',
  },

  /* ------------------------------------------------------------ banking & credit */
  {
    id: 'q-credit-1',
    categoryId: 'banking-and-credit',
    prompt: 'If you pay only the minimum payment on a credit card each month…',
    options: [
      'The balance clears just as fast',
      'Interest keeps building and the debt can stretch for years',
      'Interest is waived',
      'Your limit automatically increases',
    ],
    answerIndex: 1,
    explanation:
      'The minimum keeps your account in good standing but not much more. Interest on the remaining balance can make a purchase cost far more.',
    teachesLessonId: 'lesson-credit-cards-interest',
  },
  {
    id: 'q-credit-2',
    categoryId: 'banking-and-credit',
    prompt: 'What is a credit score used for?',
    options: [
      'Calculating your tax refund',
      'Judging how reliably you repay borrowed money',
      'Setting your hourly wage',
      'Deciding your TFSA limit',
    ],
    answerIndex: 1,
    explanation:
      'Lenders use your credit score to judge repayment reliability. On-time payments help it; missed payments and collections hurt it.',
    teachesLessonId: 'lesson-credit-cards-interest',
  },
  {
    id: 'q-credit-3',
    categoryId: 'saving-and-investing',
    prompt: 'What is an emergency fund for?',
    options: [
      'Booking spontaneous trips',
      'Covering surprise costs without borrowing at high interest',
      'Paying your taxes early',
      'Buying investments on margin',
    ],
    answerIndex: 1,
    explanation:
      'A cushion turns an emergency into an inconvenience — you pay once instead of paying interest for months.',
    teachesLessonId: 'lesson-emergency-fund',
  },
];

/**
 * Quizzes. `questionIds` omitted means "every question in this category",
 * so adding a question to the bank automatically extends the topic quiz.
 */
export const quizzes: Quiz[] = [
  ...moduleQuizzes,
  {
    id: 'quiz-weekly',
    slug: 'quiz-of-the-week',
    title: 'Quiz of the Week',
    description: 'A fresh ten-question mix. New set every week.',
    emoji: '⚡',
    kind: 'weekly',
    xpPerCorrect: 5,
    order: 0,
  },
  {
    id: 'quiz-tax-basics',
    slug: 'the-basics',
    title: 'The Basics',
    description: 'Who files, why, and how refunds work.',
    emoji: '🧾',
    kind: 'topic',
    categoryId: 'tax-basics',
    xpPerCorrect: 4,
    order: 1,
  },
  {
    id: 'quiz-your-paycheque',
    slug: 'your-paycheque',
    title: 'Your Paycheque',
    description: 'Gross, net, CPP and EI.',
    emoji: '💵',
    kind: 'topic',
    categoryId: 'your-paycheque',
    xpPerCorrect: 4,
    order: 2,
  },
  {
    id: 'quiz-slips',
    slug: 'slips-and-documents',
    title: 'Slips & Documents',
    description: 'T4, T4A, T5, T2202 and the TD1.',
    emoji: '📄',
    kind: 'topic',
    categoryId: 'slips-and-documents',
    xpPerCorrect: 4,
    order: 3,
  },
  {
    id: 'quiz-deadlines',
    slug: 'deadlines-and-penalties',
    title: 'Deadlines & Penalties',
    description: "When to file and what happens if you're late.",
    emoji: '⏰',
    kind: 'topic',
    categoryId: 'deadlines-and-penalties',
    xpPerCorrect: 4,
    order: 4,
  },
  {
    id: 'quiz-benefits',
    slug: 'credits-and-benefits',
    title: 'Credits & Benefits',
    description: 'CGEB (formerly GST/HST credit), free help, and payments.',
    emoji: '🎁',
    kind: 'topic',
    categoryId: 'credits-and-benefits',
    xpPerCorrect: 4,
    order: 5,
  },
  {
    id: 'quiz-saving',
    slug: 'saving-and-growing',
    title: 'Saving & Growing',
    description: 'TFSA vs RRSP made simple.',
    emoji: '🌱',
    kind: 'topic',
    categoryId: 'tfsa-and-rrsp',
    xpPerCorrect: 4,
    order: 6,
  },
  {
    id: 'quiz-banking-credit',
    slug: 'banking-and-credit',
    title: 'Banking & Credit',
    description: 'Cards, interest, scores and cushions.',
    emoji: '💳',
    kind: 'topic',
    categoryId: 'banking-and-credit',
    xpPerCorrect: 4,
    order: 7,
  },
  {
    id: 'quiz-challenge-all',
    slug: 'knowledge-challenge',
    title: 'Knowledge Challenge',
    description: 'Every question in the bank. How much really stuck?',
    emoji: '🏆',
    kind: 'challenge',
    xpPerCorrect: 3,
    order: 8,
  },
];

export const quizById = (id: string) => quizzes.find((q) => q.id === id);
export const questionById = (id: string) => questions.find((q) => q.id === id);
export const questionsForCategory = (categoryId: string) =>
  questions.filter((q) => q.categoryId === categoryId);
