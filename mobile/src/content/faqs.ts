import type { Faq } from './types';

/**
 * FAQ, migrated from the website's FAQ page, with two entries added for the app:
 * whether an account is needed, and what works offline.
 */
export const faqs: Faq[] = [
  {
    id: 'faq-what-is',
    question: 'What is TaxIntuitive?',
    answer:
      'TaxIntuitive is a youth-focused financial-literacy project that makes taxes and personal finance easy to understand. We use trivia, expert videos, a money simulator, and plain-language guides so young people can learn how taxes actually work.',
    order: 1,
  },
  {
    id: 'faq-who-for',
    question: 'Who is this for?',
    answer:
      'Mainly high-school and college students and young adults in Canada — especially anyone about to get their first job or file their first tax return. That said, everyone is welcome; the basics are useful at any age.',
    order: 2,
  },
  {
    id: 'faq-free',
    question: 'Is TaxIntuitive free to use?',
    answer:
      'Yes. All of our learning tools — quizzes, videos, the simulator, and guides — are free to use.',
    order: 3,
  },
  {
    id: 'faq-account',
    question: 'Do I need an account?',
    answer:
      'No, not for the main app. You can read lessons, watch videos, take quizzes, use the simulator and earn XP as a guest, with your progress saved on your device. An account is only needed for Quiz Duo, inviting friends, leaderboards, and syncing your progress across devices.',
    order: 4,
  },
  {
    id: 'faq-offline',
    question: 'Does the app work offline?',
    answer:
      'Mostly yes. Lessons, guides, solo quizzes, the glossary, the simulator and FAQs all work offline once content has been downloaded, and your progress is stored locally. Quiz Duo needs an internet connection because it matches you with another player in real time.',
    order: 5,
  },
  {
    id: 'faq-advice',
    question: 'Is anything here official tax advice?',
    answer:
      'No. Everything on TaxIntuitive is for learning only and reflects general Canadian (CRA) rules, which can change. For your specific situation or the latest details, always check canada.ca or talk to a qualified professional.',
    order: 6,
  },
  {
    id: 'faq-canadian',
    question: 'Is the tax info Canadian or American?',
    answer:
      'Canadian. Our content is based on the Canada Revenue Agency (CRA) and Canadian rules — things like T4s, TFSAs, RRSPs, and the GST/HST credit.',
    order: 7,
  },
  {
    id: 'faq-updates',
    question: 'How often is the content updated?',
    answer:
      'We review our content regularly and update it as tax rules and amounts change each year. Every tax lesson shows when it was last reviewed and links to its official source. When in doubt, canada.ca always has the most current figures.',
    order: 8,
  },
  {
    id: 'faq-school',
    question: 'Can my school or class use TaxIntuitive?',
    answer:
      "Absolutely — that's a big part of why it exists. Teachers and student groups are welcome to use our tools, and we're open to running workshops. Use the Workshops screen to request one.",
    order: 9,
  },
  {
    id: 'faq-suggest',
    question: 'How can I suggest a topic or ask a tax question?',
    answer:
      "We'd love that. Email us at jackyluan777@gmail.com — your question might even become the next expert video.",
    order: 10,
  },
];
