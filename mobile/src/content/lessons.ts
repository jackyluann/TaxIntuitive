import type { Lesson, OfficialSource } from './types';

/**
 * Learning Hub content, migrated from the TaxIntuitive website's "Learn the Basics" guide
 * (parts 1-7) and the homepage "Plain-Language Guides" row.
 *
 * Accuracy policy (see CONTENT-REVIEW.md):
 *  - Wording is Jacky's plain-language voice from the site, tightened for mobile.
 *  - Anything time-sensitive (deadlines, penalties, eligibility ages, service standards) is marked
 *    `needsVerification: true` and must be re-checked against canada.ca before release.
 *  - The homepage guide "What is a W-2? Explained Simply" was AMERICAN and is migrated here as
 *    "What is a T4? Explained Simply" — the Canadian equivalent.
 */

const CRA: OfficialSource = {
  label: 'Canada Revenue Agency',
  url: 'https://www.canada.ca/en/revenue-agency.html',
};
const PERSONAL_TAX: OfficialSource = {
  label: 'Personal income tax — Canada.ca',
  url: 'https://www.canada.ca/en/services/taxes/income-tax/personal-income-tax.html',
};
const NETFILE: OfficialSource = {
  label: 'NETFILE overview — CRA',
  url: 'https://www.canada.ca/en/revenue-agency/services/e-services/digital-services-individuals/netfile-overview.html',
};
const FREE_CLINICS: OfficialSource = {
  label: 'Free tax clinics — CRA',
  url: 'https://www.canada.ca/en/revenue-agency/campaigns/free-tax-help.html',
};
const GST_CREDIT: OfficialSource = {
  label: 'GST/HST credit — CRA',
  url: 'https://www.canada.ca/en/revenue-agency/services/child-family-benefits/goods-services-tax-harmonized-sales-tax-gst-hst-credit.html',
};
const TFSA: OfficialSource = {
  label: 'Tax-Free Savings Account — CRA',
  url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account.html',
};
const RRSP: OfficialSource = {
  label: 'RRSPs and related plans — CRA',
  url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans.html',
};
const CPP: OfficialSource = {
  label: 'Canada Pension Plan — Canada.ca',
  url: 'https://www.canada.ca/en/services/benefits/publicpensions/cpp.html',
};
const EI: OfficialSource = {
  label: 'Employment Insurance — Canada.ca',
  url: 'https://www.canada.ca/en/services/benefits/ei.html',
};

/** Date the seed content was last read against CRA guidance by a human. Update on every review. */
const REVIEWED = '2026-09-20';

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------------ tax basics */
  {
    id: 'lesson-tax-basics-what-are-taxes',
    slug: 'what-taxes-are-and-who-files',
    title: 'What taxes are and who needs to file',
    categoryId: 'tax-basics',
    kind: 'lesson',
    summary:
      'Taxes in plain language: where the money goes, who the CRA is, and why filing can actually pay you.',
    readingMinutes: 4,
    xp: 10,
    order: 1,
    featured: true,
    relatedQuizId: 'quiz-tax-basics',
    relatedVideoId: 'video-what-is-income-tax',
    lastReviewed: REVIEWED,
    needsVerification: false,
    officialSources: [CRA, PERSONAL_TAX],
    body: [
      {
        type: 'paragraph',
        text: 'Taxes are a part of the money you earn that goes to the government. The government uses that money for things everyone shares, like roads, schools, parks, and health care.',
      },
      {
        type: 'paragraph',
        text: 'In Canada, the group in charge of taxes is the Canada Revenue Agency, usually called the CRA. The CRA collects taxes, and it also sends some people money back through programs called benefits and credits.',
      },
      { type: 'heading', text: 'Who needs to file taxes?' },
      {
        type: 'paragraph',
        text: 'Filing means sending the CRA a summary of what you earned during the year. You might think you can skip it if you did not earn much, but here is the surprise: it is smart to file even if you earned little or nothing.',
      },
      {
        type: 'paragraph',
        text: 'That is because filing is how the CRA figures out the benefit and credit payments you are allowed to get. If you do not file, those payments can stop. So filing can actually put money in your pocket.',
      },
      {
        type: 'tip',
        title: 'You need a SIN',
        text: 'To file, you need a Social Insurance Number (SIN). This is the personal number the CRA uses to know who you are.',
      },
      { type: 'heading', text: 'What counts as income?' },
      {
        type: 'paragraph',
        text: 'Income is any money you earn, and almost all of it needs to be reported. This is not only your main job. It also includes tips, and money from side gigs like food delivery or rideshare driving. You still report this income even if no one hands you a slip for it.',
      },
      { type: 'heading', text: 'What is a refund?' },
      {
        type: 'paragraph',
        text: 'During the year, tax is often taken off your pay automatically before you even see it. If more tax was taken off than you actually needed to pay, the CRA gives the extra back to you. That is called a refund. A refund is not a gift or free money — it is simply your own money coming back.',
      },
    ],
    keyTakeaways: [
      'The CRA is the group that runs taxes in Canada.',
      'You need a SIN to file your taxes.',
      'File every year, even with little or no income, so you keep getting benefits.',
      'Report all income, including tips and gig work, even without a slip.',
      'A refund is overpaid tax coming back to you.',
    ],
  },

  /* --------------------------------------------------------------- your paycheque */
  {
    id: 'lesson-paycheque-gross-vs-net',
    slug: 'why-your-pay-is-smaller-than-expected',
    title: 'Why your pay is smaller than you expected',
    categoryId: 'your-paycheque',
    kind: 'lesson',
    summary:
      'Gross pay, net pay, and the three deductions that explain the gap on your very first pay stub.',
    readingMinutes: 4,
    xp: 10,
    order: 1,
    featured: true,
    relatedQuizId: 'quiz-your-paycheque',
    relatedVideoId: 'video-first-paycheque',
    lastReviewed: REVIEWED,
    needsVerification: false,
    officialSources: [CPP, EI, PERSONAL_TAX],
    body: [
      {
        type: 'paragraph',
        text: 'When you start a job, the full amount you earn is called your gross pay. The amount that actually lands in your bank account is your net pay, also called take home pay. A few things get taken off in between. This is normal, and it is not a mistake by your employer.',
      },
      {
        type: 'flow',
        steps: [
          { label: 'Gross pay', caption: 'what you earn', tone: 'neutral' },
          { label: 'Minus', caption: 'income tax, CPP, EI', tone: 'minus' },
          { label: 'Net pay', caption: 'what you keep', tone: 'plus' },
        ],
      },
      { type: 'heading', text: 'The three main things taken off' },
      {
        type: 'bullets',
        items: [
          'Income tax is your share of taxes on the money you earn.',
          'CPP stands for the Canada Pension Plan. It is money set aside for when you are much older and retire.',
          'EI stands for Employment Insurance. It can give you some money to live on if you lose your job.',
        ],
      },
      {
        type: 'tip',
        title: 'Good to know',
        text: 'Because these come off automatically, many people are surprised by their first paycheque. Now you will not be. If you add up income tax, CPP, and EI, that is the gap between your gross pay and your take home pay.',
      },
      {
        type: 'example',
        title: 'Reading your pay stub',
        text: 'Find three lines on your stub: gross (or "earnings"), a deductions section, and net (or "net pay"). The deductions section is where income tax, CPP and EI show up — each on its own line, usually with a "year to date" total beside it.',
      },
    ],
    keyTakeaways: [
      'Gross pay is what you earn. Net pay is what you keep.',
      'Income tax, CPP, and EI are taken off your pay.',
      'A smaller paycheque is normal, not an employer error.',
    ],
  },

  /* ---------------------------------------------------------- slips and documents */
  {
    id: 'lesson-slips-overview',
    slug: 'tax-slips-t4-t4a-t5-t2202',
    title: 'Tax slips: T4, T4A, T5 and T2202',
    categoryId: 'slips-and-documents',
    kind: 'lesson',
    summary: 'The four slips young Canadians see most, and what each one reports.',
    readingMinutes: 4,
    xp: 10,
    order: 1,
    relatedQuizId: 'quiz-slips',
    relatedVideoId: 'video-what-is-a-t4',
    lastReviewed: REVIEWED,
    needsVerification: false,
    officialSources: [CRA, PERSONAL_TAX],
    body: [
      {
        type: 'paragraph',
        text: 'A slip is a small form that reports money you earned. When it is time to file, you use the numbers on your slips. Keep every slip you get. Here are the ones young people see most.',
      },
      {
        type: 'slips',
        items: [
          {
            tag: 'T4',
            text: 'Shows the money you earned from a job, and the tax already taken off.',
          },
          {
            tag: 'T4A',
            text: 'Covers other income like scholarships, and some self employed or pension income.',
          },
          {
            tag: 'T5',
            text: 'Shows interest you earned, for example from a savings account or investments.',
          },
          {
            tag: 'T2202',
            text: 'Shows the tuition you paid as a student at a college or university.',
          },
        ],
      },
      { type: 'heading', text: 'What about tuition?' },
      {
        type: 'paragraph',
        text: 'If you paid tuition, the T2202 is useful. You do not have to use all of it right away. You can use it to lower your own tax, save it and carry it forward to a future year, or in some cases transfer it to a parent or grandparent.',
      },
      {
        type: 'tip',
        title: 'Remember',
        text: 'Even if a slip never arrives for some income, like cash tips, you still report that money.',
      },
    ],
    keyTakeaways: [
      'T4 is job income. T4A is scholarships and some other income.',
      'T5 is interest and investment income. T2202 is tuition.',
      'Tuition can be claimed, carried forward, or transferred.',
      'No slip does not mean no reporting — cash tips still count.',
    ],
  },
  {
    id: 'lesson-td1',
    slug: 'the-td1-form',
    title: 'The TD1: the form you fill in yourself',
    categoryId: 'slips-and-documents',
    kind: 'lesson',
    summary:
      'The one tax form your employer hands you on day one, and why filling it in carefully saves you surprises.',
    readingMinutes: 2,
    xp: 10,
    order: 2,
    relatedQuizId: 'quiz-slips',
    relatedVideoId: 'video-what-is-td1',
    lastReviewed: REVIEWED,
    needsVerification: false,
    officialSources: [CRA],
    body: [
      {
        type: 'paragraph',
        text: 'A TD1 is a form you fill in when you start a new job. It tells your employer how much tax to take off your pay.',
      },
      {
        type: 'paragraph',
        text: 'Filling it in carefully helps make sure the right amount of tax comes off, so you avoid surprises later. Rush it and you can end up with too much tax withheld (a smaller paycheque all year) or too little (a bill at tax time).',
      },
      {
        type: 'warning',
        title: 'Two minutes well spent',
        text: 'The TD1 is short, but it is the one place you control your own withholding. Read each line instead of signing blind.',
      },
    ],
    keyTakeaways: [
      'A TD1 tells your employer how much tax to take off your pay.',
      'You fill it in yourself when you are hired.',
      'Careful answers now prevent a surprise bill or an over-withheld year.',
    ],
  },

  /* ------------------------------------------------------- deadlines and penalties */
  {
    id: 'lesson-deadlines',
    slug: 'deadlines-and-penalties',
    title: 'Deadlines, penalties and getting your refund',
    categoryId: 'deadlines-and-penalties',
    kind: 'lesson',
    summary: 'When to file, what late filing costs, and how fast refunds usually arrive.',
    readingMinutes: 4,
    xp: 15,
    order: 1,
    relatedQuizId: 'quiz-deadlines',
    relatedVideoId: 'video-when-must-i-file',
    lastReviewed: REVIEWED,
    needsVerification: true,
    officialSources: [PERSONAL_TAX, NETFILE, FREE_CLINICS],
    body: [
      {
        type: 'paragraph',
        text: 'Filing your taxes once a year sounds scary, but it is mostly just entering the numbers from your slips. Most people file online for free using approved software. The service that sends your return to the CRA is called NETFILE.',
      },
      { type: 'heading', text: 'The dates that matter' },
      {
        type: 'bullets',
        items: [
          'For most people, the deadline to file and to pay anything you owe is April 30.',
          'If you work for yourself, you have until June 15 to file. Even then, you still pay anything you owe by April 30.',
        ],
      },
      {
        type: 'warning',
        title: 'Check the current year',
        text: 'Deadlines shift when they land on a weekend or holiday, and penalty rules can change. Always confirm this year’s dates on canada.ca before you rely on them.',
      },
      { type: 'heading', text: 'What if you file late?' },
      {
        type: 'paragraph',
        text: 'If you owe money and file late, the CRA charges a late filing penalty. It is a percentage of the amount you owe, plus an additional amount for each full month you are late. That adds up fast, so it is smart to file on time.',
      },
      {
        type: 'warning',
        title: 'Important',
        text: 'Even if you cannot pay right away, still file on time. The late penalty is charged on top of any interest, so filing late only makes things worse.',
      },
      { type: 'heading', text: 'Getting your refund' },
      {
        type: 'paragraph',
        text: 'When you file online and use direct deposit, a refund usually reaches you in about two weeks. If your tax situation is simple and your income is modest, you can also get free help at CRA volunteer tax clinics, so you do not have to pay anyone to file for you.',
      },
    ],
    keyTakeaways: [
      'NETFILE is the free way to file online through approved software.',
      'The main deadline is April 30; self-employed people file by June 15 but still pay by April 30.',
      'Filing late when you owe adds a penalty on top of interest.',
      'Online refunds with direct deposit usually arrive in about two weeks.',
      'Free help is available through CRA volunteer tax clinics.',
    ],
  },

  /* ------------------------------------------------------- credits and benefits */
  {
    id: 'lesson-credits-benefits',
    slug: 'credits-and-benefits',
    title: 'Credits and benefits: money that comes back',
    categoryId: 'credits-and-benefits',
    kind: 'lesson',
    summary:
      'Filing is not only about paying. It is how the CRA works out payments owed to you.',
    readingMinutes: 3,
    xp: 15,
    order: 1,
    relatedQuizId: 'quiz-benefits',
    relatedVideoId: 'video-how-gst-hst-works',
    lastReviewed: REVIEWED,
    needsVerification: true,
    officialSources: [GST_CREDIT, CRA],
    body: [
      {
        type: 'paragraph',
        text: 'Here is a part people wish they learned sooner. Filing your taxes is not only about paying. It can also unlock payments that come to you, even if you earned very little.',
      },
      { type: 'heading', text: 'The GST/HST credit' },
      {
        type: 'paragraph',
        text: 'One common one is the GST/HST credit. It is a tax free payment that helps lower income people with the sales tax they pay on everyday things. A few points to know:',
      },
      {
        type: 'bullets',
        items: [
          'You usually need to be 19 or older to get it on your own.',
          'It is tax free, which means you do not pay any tax on it.',
          'You do not fill out a separate application. The CRA works out if you qualify automatically when you file.',
        ],
      },
      {
        type: 'warning',
        title: 'Amounts and ages change',
        text: 'Eligibility rules and payment amounts are updated regularly. Confirm the current rules on canada.ca before counting on a payment.',
      },
      { type: 'heading', text: 'Why filing matters so much' },
      {
        type: 'paragraph',
        text: 'Payments like the GST/HST credit and the Canada Child Benefit are calculated using the information on your tax return. No return means the CRA cannot calculate them, so the payments can stop. The rule is simple: file every single year, even a year when you had no income, so your payments keep coming.',
      },
    ],
    keyTakeaways: [
      'The GST/HST credit is a tax free payment for lower income people.',
      'You generally need to be 19 or older to get it on your own.',
      'You get it just by filing. There is no separate application.',
      'Benefit payments are based on your return, so file every year.',
    ],
  },

  /* --------------------------------------------------- employment and gig income */
  {
    id: 'lesson-gig-income',
    slug: 'tips-side-gigs-and-self-employment',
    title: 'Tips, side gigs and self-employment',
    categoryId: 'employment-and-gig-income',
    kind: 'lesson',
    summary:
      'When nobody withholds tax for you, the job becomes yours. What to track and what to set aside.',
    readingMinutes: 3,
    xp: 15,
    order: 1,
    relatedQuizId: 'quiz-tax-basics',
    relatedVideoId: 'video-going-freelance',
    lastReviewed: REVIEWED,
    needsVerification: true,
    officialSources: [PERSONAL_TAX, CRA],
    body: [
      {
        type: 'paragraph',
        text: 'Delivery shifts, rideshare driving, freelance design, tutoring, reselling — it all counts as income, and it all gets reported. You report it even when no one hands you a slip.',
      },
      { type: 'heading', text: 'The big difference: nobody withholds for you' },
      {
        type: 'paragraph',
        text: 'At a regular job, your employer takes income tax off every paycheque before you see it. When you work for yourself, that does not happen. The full payment lands in your account, and the tax on it is still owed later.',
      },
      {
        type: 'tip',
        title: 'Set money aside as you go',
        text: 'Many self-employed people move a portion of every payment into a separate savings account the day it arrives, so tax time is not a shock. How much depends on your total income — a professional can help you pick a realistic percentage.',
      },
      { type: 'heading', text: 'Keep records' },
      {
        type: 'bullets',
        items: [
          'Save every payment record, invoice and receipt.',
          'Track expenses connected to the work — some may be deductible.',
          'Keep business money separate from personal money if you can. It makes filing far easier.',
        ],
      },
      {
        type: 'warning',
        title: 'Self-employment has its own rules',
        text: 'Filing deadlines, instalment payments, CPP contributions and GST/HST registration work differently once you are self-employed. Check canada.ca or talk to a professional before your first self-employed return.',
      },
    ],
    keyTakeaways: [
      'All income is reported, including tips and gig work with no slip.',
      'Self-employed income has no tax withheld — you set it aside yourself.',
      'Keep records of payments and work-related expenses.',
      'Self-employment brings extra rules worth checking early.',
    ],
  },

  /* -------------------------------------------------------- saving and investing */
  {
    id: 'lesson-emergency-fund',
    slug: 'emergency-funds-and-making-money-grow',
    title: 'Emergency funds and making money grow',
    categoryId: 'saving-and-investing',
    kind: 'lesson',
    summary:
      'The cushion that turns emergencies into inconveniences, and why idle cash quietly loses ground.',
    readingMinutes: 3,
    xp: 10,
    order: 1,
    relatedQuizId: 'quiz-saving',
    lastReviewed: REVIEWED,
    needsVerification: false,
    officialSources: [CRA],
    body: [
      {
        type: 'paragraph',
        text: 'An emergency fund is money you keep aside for the surprises: a car repair you need to get to work, a dental bill, a phone that dies. It is the difference between an emergency and an inconvenience.',
      },
      { type: 'heading', text: 'Why it matters more than it sounds' },
      {
        type: 'paragraph',
        text: 'Without a cushion, a surprise bill goes on a credit card. With interest, that repair can end up costing far more than the sticker price. With a cushion, you pay once and move on.',
      },
      {
        type: 'tip',
        title: 'Start small, start now',
        text: 'A cushion does not have to be huge to work. Setting aside a set amount every payday, automatically, beats waiting until you can save a big number.',
      },
      { type: 'heading', text: 'Do not let savings sit idle' },
      {
        type: 'paragraph',
        text: 'Money in a plain chequing account does not grow. Moving savings somewhere that earns — for example inside a TFSA — lets it work for you instead of standing still.',
      },
    ],
    keyTakeaways: [
      'An emergency fund turns emergencies into inconveniences.',
      'Without savings, surprises become high-interest debt.',
      'Automatic, regular saving beats waiting to save a big amount.',
      'Idle cash does not grow — put savings where they earn.',
    ],
  },

  /* ---------------------------------------------------------------- tfsa and rrsp */
  {
    id: 'lesson-tfsa-vs-rrsp',
    slug: 'tfsa-vs-rrsp',
    title: 'TFSA vs RRSP: opposite superpowers',
    categoryId: 'tfsa-and-rrsp',
    kind: 'lesson',
    summary:
      'Two registered accounts that work in almost opposite ways. Which helps now, and which helps later.',
    readingMinutes: 4,
    xp: 15,
    order: 1,
    featured: true,
    relatedQuizId: 'quiz-saving',
    relatedVideoId: 'video-tfsa-vs-rrsp',
    lastReviewed: REVIEWED,
    needsVerification: true,
    officialSources: [TFSA, RRSP],
    body: [
      {
        type: 'paragraph',
        text: 'Once you start earning, two special accounts can help your money grow with less tax. They work in almost opposite ways, so it helps to know the difference.',
      },
      { type: 'heading', text: 'The TFSA (Tax Free Savings Account)' },
      {
        type: 'bullets',
        items: [
          'You can start using one at age 18, once you have a SIN.',
          'Your money grows tax free, and when you take it out, the withdrawals are tax free too.',
          'Putting money in does not lower your tax bill. In other words, contributions are not tax deductible.',
          'When you take money out, that room comes back, but not until the next calendar year.',
        ],
      },
      { type: 'heading', text: 'The RRSP (Registered Retirement Savings Plan)' },
      {
        type: 'bullets',
        items: [
          'Putting money in can lower the tax you owe now. Contributions are tax deductible.',
          'You pay tax later, when you take the money out, usually when you are older and retired.',
        ],
      },
      { type: 'heading', text: 'Side by side' },
      {
        type: 'table',
        headers: ['Question', 'TFSA', 'RRSP'],
        rows: [
          ['Lowers your tax now?', 'No', 'Yes'],
          ['Taxed when you take money out?', 'No', 'Yes'],
          [
            'Best thought of as',
            'Flexible savings you can use anytime',
            'Long term savings for retirement',
          ],
        ],
      },
      {
        type: 'tip',
        title: 'Simple way to remember it',
        text: 'The RRSP gives you a tax break now. The TFSA gives you tax free money later. Which one is better depends on your own situation.',
      },
      {
        type: 'warning',
        title: 'Limits change every year',
        text: 'Contribution room, the minimum age in some provinces, and withdrawal rules are all set by current rules. Check canada.ca for this year’s numbers before you contribute.',
      },
    ],
    keyTakeaways: [
      'You can open a TFSA at age 18.',
      'TFSA withdrawals are tax free, and contributions are not tax deductible.',
      'TFSA room you use comes back the next calendar year.',
      'RRSP contributions are tax deductible, and withdrawals are taxed as income.',
      'The RRSP gives the tax break now. The TFSA gives tax free money later.',
    ],
  },

  /* ------------------------------------------------------------ banking & credit */
  {
    id: 'lesson-credit-cards-interest',
    slug: 'credit-cards-interest-and-scores',
    title: 'Credit cards, interest and your credit score',
    categoryId: 'banking-and-credit',
    kind: 'lesson',
    summary:
      'How a credit card actually works, why minimum payments are a trap, and what a credit score is for.',
    readingMinutes: 4,
    xp: 10,
    order: 1,
    relatedQuizId: 'quiz-banking-credit',
    lastReviewed: REVIEWED,
    needsVerification: false,
    officialSources: [
      {
        label: 'Credit cards — Financial Consumer Agency of Canada',
        url: 'https://www.canada.ca/en/financial-consumer-agency/services/credit-cards.html',
      },
    ],
    body: [
      {
        type: 'paragraph',
        text: 'A credit card is borrowed money. When you pay the full balance by the due date, borrowing is usually free. When you do not, interest starts adding up on what is left.',
      },
      { type: 'heading', text: 'Why minimum payments are a trap' },
      {
        type: 'paragraph',
        text: 'The minimum payment is the smallest amount that keeps your account in good standing. It is not the amount that clears your debt. Paying only the minimum can stretch a purchase over years, and you can end up paying far more than the original price.',
      },
      {
        type: 'warning',
        title: 'Borrowing for wants',
        text: 'Putting a trip or a want on a card you cannot pay off is how credit card debt snowballs. High-interest debt now limits your choices later.',
      },
      { type: 'heading', text: 'Chequing vs savings' },
      {
        type: 'bullets',
        items: [
          'A chequing account is for money moving through your life: pay in, bills out.',
          'A savings account is for money staying put, and it usually earns a little interest.',
          'Direct deposit sends your pay straight into your account, and automatic transfers move savings without you thinking about it.',
        ],
      },
      { type: 'heading', text: 'What a credit score is' },
      {
        type: 'paragraph',
        text: 'A credit score is a number lenders use to judge how reliably you repay what you borrow. Paying on time and not using all of your available credit help it. Missed payments and accounts sent to collections hurt it.',
      },
    ],
    keyTakeaways: [
      'Paying your full balance on time usually means no interest.',
      'Minimum payments keep the account current but stretch debt for years.',
      'Chequing is for money moving; savings is for money staying.',
      'On-time payments build a credit score; missed ones damage it.',
    ],
  },

  /* -------------------------------------------------------------------- glossary */
  {
    id: 'lesson-glossary',
    slug: 'tax-glossary',
    title: 'Tax glossary: every term in one place',
    categoryId: 'tax-glossary',
    kind: 'lesson',
    summary: 'Quick meanings of the words used across TaxIntuitive.',
    readingMinutes: 3,
    xp: 10,
    order: 1,
    lastReviewed: REVIEWED,
    needsVerification: false,
    officialSources: [CRA],
    body: [
      {
        type: 'paragraph',
        text: 'Quick meanings of the words used in these lessons. Tap any term in the Glossary tab to see it on its own.',
      },
      {
        type: 'terms',
        items: [
          'CRA',
          'SIN',
          'Gross pay',
          'Net pay',
          'CPP',
          'EI',
          'NETFILE',
          'Refund',
          'GST/HST credit',
          'TFSA',
          'RRSP',
          'T4',
          'T4A',
          'T5',
          'T2202',
          'TD1',
        ],
      },
    ],
    keyTakeaways: ['Knowing the vocabulary makes every other lesson easier.'],
  },

  /* ================================================================== GUIDES ==== *
   * The homepage "Plain-Language Guides" row. Migrated as guides so one screen renders
   * both lessons and guides.                                                        */

  {
    id: 'guide-file-first-return',
    slug: 'how-to-file-your-first-tax-return',
    title: 'How to File Your First Tax Return',
    categoryId: 'first-tax-return',
    kind: 'guide',
    summary: 'Step by step, from gathering slips to hitting submit.',
    readingMinutes: 5,
    xp: 20,
    order: 1,
    featured: true,
    relatedQuizId: 'quiz-deadlines',
    relatedVideoId: 'video-when-must-i-file',
    lastReviewed: REVIEWED,
    needsVerification: true,
    officialSources: [NETFILE, FREE_CLINICS, PERSONAL_TAX],
    body: [
      {
        type: 'paragraph',
        text: 'Your first return is mostly copying numbers from your slips into software that does the math. Here is the whole path.',
      },
      {
        type: 'numbered',
        items: [
          'Make sure you have a SIN. You cannot file without one.',
          'Gather your slips — a T4 from each job, plus any T4A, T5 or T2202.',
          'Pick CRA-approved software. Many options are free for simple returns.',
          'Consider registering for CRA My Account, which can auto-fill slips the CRA already has.',
          'Enter your slips exactly as they appear. Do not round or guess.',
          'Add income with no slip, like cash tips or gig work.',
          'Claim what applies to you — for example tuition from a T2202.',
          'Set up direct deposit so a refund arrives faster.',
          'Review the summary, then send it through NETFILE.',
          'Save your confirmation number and keep your slips and receipts.',
        ],
      },
      {
        type: 'tip',
        title: 'Free help exists',
        text: 'If your income is modest and your return is simple, CRA volunteer tax clinics will file with you at no cost. You never have to pay someone to file a simple return.',
      },
      {
        type: 'warning',
        title: 'Before you rely on dates',
        text: 'Filing deadlines and what counts as "simple" change. Confirm the current year on canada.ca.',
      },
    ],
    keyTakeaways: [
      'You need a SIN, your slips, and approved software.',
      'CRA My Account can auto-fill slips the CRA already has.',
      'Report income even when no slip exists.',
      'Direct deposit gets a refund to you faster.',
      'Keep your confirmation number and documents after filing.',
    ],
  },
  {
    id: 'guide-what-is-a-t4',
    slug: 'what-is-a-t4-explained-simply',
    title: 'What is a T4? Explained Simply',
    categoryId: 'slips-and-documents',
    kind: 'guide',
    summary:
      'The slip your employer gives you at tax time, what each part means, and why you cannot file without it.',
    readingMinutes: 3,
    xp: 15,
    order: 2,
    featured: true,
    relatedQuizId: 'quiz-slips',
    relatedVideoId: 'video-what-is-a-t4',
    lastReviewed: REVIEWED,
    needsVerification: false,
    officialSources: [CRA, PERSONAL_TAX],
    body: [
      {
        type: 'paragraph',
        text: 'A T4 is the slip your employer gives you after the end of the year. It is the official summary of what that job paid you, and what was already taken off your pay.',
      },
      {
        type: 'tip',
        title: 'Canadian note',
        text: 'If you have seen American videos mention a "W-2", the T4 is the Canadian equivalent. In Canada you will get a T4, not a W-2.',
      },
      { type: 'heading', text: 'What is on it' },
      {
        type: 'bullets',
        items: [
          'Your employment income for the year from that employer.',
          'Income tax already deducted and sent to the CRA on your behalf.',
          'Your CPP contributions.',
          'Your EI premiums.',
        ],
      },
      { type: 'heading', text: 'How you use it' },
      {
        type: 'paragraph',
        text: 'When you file, you enter the T4 amounts into your tax software. The tax already deducted counts toward what you owe — which is exactly how a refund happens when too much was taken off.',
      },
      {
        type: 'warning',
        title: 'One T4 per job',
        text: 'Worked two jobs? You get a T4 from each, and you report all of them. Missing one means an incomplete return.',
      },
    ],
    keyTakeaways: [
      'A T4 reports one job’s income and the tax already withheld.',
      'The T4 is the Canadian equivalent of the American W-2.',
      'It also shows your CPP contributions and EI premiums.',
      'You get one T4 per job, and you report every one of them.',
    ],
  },
  {
    id: 'guide-deductions-vs-credits',
    slug: 'understanding-deductions-and-credits',
    title: 'Understanding Deductions & Credits',
    categoryId: 'credits-and-benefits',
    kind: 'guide',
    summary: 'Two different ways your tax bill gets smaller, and why the difference matters.',
    readingMinutes: 3,
    xp: 15,
    order: 3,
    featured: true,
    relatedQuizId: 'quiz-benefits',
    lastReviewed: REVIEWED,
    needsVerification: true,
    officialSources: [PERSONAL_TAX, CRA],
    body: [
      {
        type: 'paragraph',
        text: 'People use "deduction" and "credit" as if they mean the same thing. They do not, and the difference changes how much you actually save.',
      },
      { type: 'heading', text: 'A deduction lowers the income you are taxed on' },
      {
        type: 'paragraph',
        text: 'A deduction comes off your income before tax is calculated. An RRSP contribution is the classic example: put money in, and there is less income left to tax.',
      },
      { type: 'heading', text: 'A credit lowers the tax itself' },
      {
        type: 'paragraph',
        text: 'A credit is applied after your tax is calculated, reducing the tax amount directly. Tuition from a T2202 works this way.',
      },
      {
        type: 'table',
        headers: ['', 'Deduction', 'Credit'],
        rows: [
          ['Applies to', 'Your income', 'Your tax'],
          ['Example', 'RRSP contribution', 'Tuition (T2202)'],
          ['Applied', 'Before tax is worked out', 'After tax is worked out'],
        ],
      },
      {
        type: 'tip',
        title: 'Refundable vs non-refundable',
        text: 'Some credits can only reduce tax to zero. Others, like the GST/HST credit, can pay you even when you owe nothing — which is why filing matters at low incomes.',
      },
      {
        type: 'warning',
        title: 'What you can claim changes',
        text: 'Which deductions and credits you qualify for depends on current rules and your situation. Verify on canada.ca or ask a professional.',
      },
    ],
    keyTakeaways: [
      'A deduction reduces the income you are taxed on.',
      'A credit reduces the tax you owe.',
      'RRSP contributions are a deduction; tuition is a credit.',
      'Some credits can pay you even when you owe no tax.',
    ],
  },
  {
    id: 'guide-do-i-need-to-file',
    slug: 'do-i-need-to-file-a-quick-check',
    title: 'Do I Need to File? A Quick Check',
    categoryId: 'tax-basics',
    kind: 'guide',
    summary: 'A short list of reasons to file — including the ones that pay you.',
    readingMinutes: 2,
    xp: 15,
    order: 4,
    featured: true,
    relatedQuizId: 'quiz-tax-basics',
    relatedVideoId: 'video-when-must-i-file',
    lastReviewed: REVIEWED,
    needsVerification: true,
    officialSources: [PERSONAL_TAX, GST_CREDIT],
    body: [
      {
        type: 'paragraph',
        text: 'Some people must file. Many more should file because it pays them. Read both lists.',
      },
      { type: 'heading', text: 'Reasons you may have to file' },
      {
        type: 'bullets',
        items: [
          'You owe tax for the year.',
          'You had self-employment or gig income.',
          'The CRA sent you a request to file.',
        ],
      },
      { type: 'heading', text: 'Reasons you should file anyway' },
      {
        type: 'bullets',
        items: [
          'Tax was taken off your pay and you may be owed a refund.',
          'Filing is how benefit and credit payments get calculated — no return, no payments.',
          'It starts your RRSP contribution room for the future.',
          'Tuition on a T2202 can be carried forward to a year when it helps more.',
        ],
      },
      {
        type: 'tip',
        title: 'The short version',
        text: 'If you earned anything at all, file. At low incomes, filing is usually how you get money rather than owe it.',
      },
      {
        type: 'warning',
        title: 'Confirm your own situation',
        text: 'Whether you are required to file depends on current rules and your circumstances. Check canada.ca or a professional if you are unsure.',
      },
    ],
    keyTakeaways: [
      'You must file if you owe tax, had gig income, or the CRA asks.',
      'You should file to claim a refund and keep benefits flowing.',
      'Filing builds RRSP room and banks tuition credits.',
      'When in doubt at a low income, filing usually pays you.',
    ],
  },
  {
    id: 'guide-tax-brackets',
    slug: 'how-tax-brackets-actually-work',
    title: 'How Tax Brackets Actually Work',
    categoryId: 'tax-basics',
    kind: 'guide',
    summary:
      'The biggest tax myth, busted: a raise does not tax every dollar you earn at a higher rate.',
    readingMinutes: 3,
    xp: 15,
    order: 5,
    relatedQuizId: 'quiz-tax-basics',
    relatedVideoId: 'video-tax-brackets',
    lastReviewed: REVIEWED,
    needsVerification: true,
    officialSources: [PERSONAL_TAX, CRA],
    body: [
      {
        type: 'paragraph',
        text: 'Here is the myth: "I got a raise and moved into a higher tax bracket, so now I take home less." That is not how it works.',
      },
      { type: 'heading', text: 'Brackets apply to slices, not the whole pie' },
      {
        type: 'paragraph',
        text: 'Canada uses graduated tax rates. Your income is divided into slices, and each slice is taxed at its own rate. Moving into a higher bracket only changes the rate on the dollars inside that higher slice — not on the dollars below it.',
      },
      {
        type: 'example',
        title: 'The idea in plain numbers',
        text: 'Imagine the first slice of income is taxed at a low rate and the next slice at a higher one. If you earn one dollar more than the start of the higher slice, only that single dollar is taxed at the higher rate. Everything underneath is taxed exactly as before.',
      },
      {
        type: 'tip',
        title: 'So a raise is still a raise',
        text: 'More income always means more take-home pay in Canada. You keep less of the top slice than the bottom slice, but you never go backwards.',
      },
      {
        type: 'warning',
        title: 'Rates and thresholds change yearly',
        text: 'This guide deliberately avoids quoting rates or bracket amounts, because federal and provincial numbers are updated annually. Look up the current year on canada.ca.',
      },
    ],
    keyTakeaways: [
      'Canada taxes income in slices, each at its own rate.',
      'A higher bracket applies only to the dollars in that bracket.',
      'Earning more never lowers your total take-home pay.',
      'Bracket thresholds and rates change every year — always look them up.',
    ],
  },
];

export const lessonById = (id: string) => lessons.find((l) => l.id === id);
export const lessonsByCategory = (categoryId: string) =>
  lessons.filter((l) => l.categoryId === categoryId).sort((a, b) => a.order - b.order);
export const guides = () => lessons.filter((l) => l.kind === 'guide');
export const featuredLessons = () => lessons.filter((l) => l.featured);
