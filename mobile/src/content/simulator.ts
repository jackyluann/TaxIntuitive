import type { SimulatorConfig } from './types';

/**
 * "Survive Your First Year" — migrated from the website simulator and extended to cover the
 * decision areas the app spec calls for (budgeting, banking, credit, education, gig income,
 * TFSA/RRSP), tracking cash, savings, debt and estimated tax alongside a Money Smarts score.
 *
 * Numbers are deliberately simplified teaching figures, not tax calculations.
 */
export const simulator: SimulatorConfig = {
  startingCash: 1200,
  startingAge: 18,
  hourlyWage: 20,
  scenarios: [
    {
      id: 'sim-td1',
      monthLabel: 'Month 1 — Getting hired',
      prompt:
        'Your new employer hands you a TD1 form to fill out before your first shift. What do you do?',
      categoryId: 'slips-and-documents',
      order: 1,
      options: [
        {
          id: 'sim-td1-careful',
          label: 'Fill it out carefully — it sets how much tax comes off your pay',
          cashDelta: 0,
          smartsDelta: 15,
          feedback:
            'Smart. The TD1 tells your employer how much tax to withhold. Getting it right means fewer surprises at tax time.',
          lesson: 'A TD1 form controls how much tax is taken off each paycheque.',
        },
        {
          id: 'sim-td1-rush',
          label: 'Scribble anything so you can start working',
          cashDelta: 0,
          smartsDelta: 0,
          feedback:
            "It won't ruin you, but a careless TD1 can mean too much (or too little) tax withheld. Worth two minutes to do right.",
          lesson: 'Rushing your TD1 can throw off your paycheque withholding.',
        },
      ],
    },
    {
      id: 'sim-first-pay',
      monthLabel: 'Month 2 — First paycheque',
      prompt:
        'You worked at $20/hr but your first paycheque is smaller than you expected. Your reaction?',
      categoryId: 'your-paycheque',
      order: 2,
      options: [
        {
          id: 'sim-first-pay-check',
          label: 'Check the pay stub — taxes, CPP and EI are deducted',
          cashDelta: 1000,
          incomeDelta: 1000,
          smartsDelta: 15,
          feedback:
            'Exactly. Gross pay minus income tax, CPP and EI = your take-home. Now that gap makes sense. (+$1,000 banked.)',
          lesson: 'Take-home pay = gross pay minus tax, CPP and EI.',
        },
        {
          id: 'sim-first-pay-complain',
          label: 'Assume your boss made an error and complain',
          cashDelta: 1000,
          incomeDelta: 1000,
          smartsDelta: 0,
          feedback:
            'The math is right — those are normal payroll deductions, not a mistake. Still got paid though. (+$1,000 banked.)',
          lesson: 'Payroll deductions are normal, not an employer error.',
        },
      ],
    },
    {
      id: 'sim-banking',
      monthLabel: 'Month 3 — Setting up money',
      prompt:
        'Your pay is landing in one chequing account and disappearing. How do you organize it?',
      categoryId: 'banking-and-credit',
      order: 3,
      options: [
        {
          id: 'sim-banking-auto',
          label: 'Set up direct deposit plus an automatic transfer to savings each payday',
          cashDelta: 0,
          savingsDelta: 200,
          smartsDelta: 15,
          feedback:
            'This is the single highest-leverage money habit. Saving automatically means you never have to rely on willpower. ($200 moved to savings.)',
          lesson: 'Automatic transfers on payday build savings without willpower.',
        },
        {
          id: 'sim-banking-manual',
          label: "Keep it all in chequing and save whatever's left at month end",
          cashDelta: 0,
          smartsDelta: 5,
          feedback:
            "Nothing is usually left at month end — that's how it goes for most people. Paying yourself first works better.",
          lesson: 'Saving "what is left over" usually means saving nothing.',
        },
      ],
    },
    {
      id: 'sim-car-repair',
      monthLabel: 'Month 4 — A surprise bill',
      prompt: 'Your car needs a $1,200 repair to get to work. How do you handle it?',
      categoryId: 'saving-and-investing',
      order: 4,
      options: [
        {
          id: 'sim-car-savings',
          label: 'Pay from savings — this is what an emergency fund is for',
          cashDelta: -1200,
          smartsDelta: 15,
          feedback:
            'Ouch, but exactly right. Paying cash avoids interest. This is why a cushion matters.',
          lesson: 'An emergency fund saves you from borrowing at high interest.',
        },
        {
          id: 'sim-car-credit',
          label: 'Put it on a credit card and pay the minimum',
          cashDelta: -1200,
          debtDelta: 1200,
          smartsDelta: 5,
          feedback:
            "You covered it, but carrying that balance adds interest — you'll pay well over $1,200 in the end.",
          lesson: 'Credit card interest makes borrowed money cost much more.',
        },
      ],
    },
    {
      id: 'sim-tax-season',
      monthLabel: 'Month 6 — Tax season',
      prompt: "It's your first tax season. Filing a return feels like a hassle. Do you file?",
      categoryId: 'first-tax-return',
      order: 5,
      options: [
        {
          id: 'sim-file-yes',
          label: 'File it — even with a small income',
          cashDelta: 900,
          smartsDelta: 20,
          feedback:
            'Great call. Filing triggered a refund of over-withheld tax AND signed you up for the GST/HST credit. (+$900 in refund and credits.)',
          lesson: 'Filing unlocks refunds and benefits like the GST/HST credit.',
        },
        {
          id: 'sim-file-no',
          label: "Skip it — you didn't make much",
          cashDelta: 0,
          smartsDelta: 0,
          feedback:
            'By skipping, you left refund money unclaimed and missed benefit payments you qualified for. File next time!',
          lesson: 'Not filing means missing refunds and benefit payments.',
        },
      ],
    },
    {
      id: 'sim-windfall',
      monthLabel: 'Month 7 — Found money',
      prompt: 'A GST/HST credit payment of $500 lands in your account. What now?',
      categoryId: 'tfsa-and-rrsp',
      order: 6,
      options: [
        {
          id: 'sim-windfall-tfsa',
          label: 'Move it into a TFSA so it can grow tax-free',
          cashDelta: 500,
          savingsDelta: 500,
          smartsDelta: 15,
          feedback:
            'Nice. In a TFSA your money grows and comes back out tax-free — perfect for building a cushion.',
          lesson: 'A TFSA lets savings grow and be withdrawn tax-free.',
        },
        {
          id: 'sim-windfall-spend',
          label: 'Treat yourself — spend it all',
          cashDelta: 500,
          expenseDelta: 500,
          smartsDelta: 0,
          feedback:
            'You earned a little fun, but that was a chance to build savings. Balance is key.',
          lesson: 'Windfalls are a chance to build savings, not just spend.',
        },
      ],
    },
    {
      id: 'sim-side-gig',
      monthLabel: 'Month 8 — A side gig',
      prompt:
        'You start doing freelance graphic design on weekends. No employer is taking tax off. What is your move?',
      categoryId: 'employment-and-gig-income',
      order: 7,
      options: [
        {
          id: 'sim-gig-setaside',
          label: 'Set aside a share of each payment for taxes',
          cashDelta: 800,
          incomeDelta: 800,
          estimatedTaxDelta: 200,
          smartsDelta: 20,
          feedback:
            'Pro move. When you are self-employed, no tax is withheld — so you save for it yourself to avoid a shock. (+$800 earned, tax set aside.)',
          lesson: 'Self-employed income has no tax withheld — set some aside yourself.',
        },
        {
          id: 'sim-gig-spend',
          label: "Spend it all — it's extra money",
          cashDelta: 1000,
          incomeDelta: 1000,
          estimatedTaxDelta: 250,
          smartsDelta: 0,
          feedback:
            'Fun now, but come tax time you may owe on this income with nothing set aside. (+$1,000 spent freely — watch out next April.)',
          lesson: 'Spending all freelance income can leave you owing tax later.',
        },
      ],
    },
    {
      id: 'sim-peer-pressure',
      monthLabel: 'Month 9 — Peer pressure',
      prompt:
        "Friends want to book a spontaneous trip. You'd have to max out your credit card to go. Do you?",
      categoryId: 'banking-and-credit',
      order: 8,
      options: [
        {
          id: 'sim-trip-skip',
          label: 'Skip it or save up first',
          cashDelta: 0,
          smartsDelta: 15,
          feedback:
            'Discipline pays. Maxing a card for wants is how debt snowballs. You can travel once you have saved.',
          lesson: 'Borrowing for wants is how credit-card debt snowballs.',
        },
        {
          id: 'sim-trip-max',
          label: 'Max the card — you only live once',
          cashDelta: -900,
          debtDelta: 900,
          smartsDelta: 0,
          feedback:
            'The memories are real, but so is the balance. High-interest debt now limits your choices later.',
          lesson: 'High-interest debt limits your future choices.',
        },
      ],
    },
    {
      id: 'sim-education',
      monthLabel: 'Month 10 — Back to school',
      prompt:
        'You enroll in a college course and pay tuition. The school sends you a T2202. What do you do with it?',
      categoryId: 'slips-and-documents',
      order: 9,
      options: [
        {
          id: 'sim-edu-claim',
          label: 'Keep it and use it on your return (or carry it forward)',
          cashDelta: 0,
          smartsDelta: 15,
          feedback:
            'Right. Tuition can lower your tax now, be carried forward to a year when it helps more, or sometimes be transferred to a parent.',
          lesson: 'A T2202 can be claimed, carried forward, or transferred.',
        },
        {
          id: 'sim-edu-toss',
          label: 'Toss it — it looks like junk mail',
          cashDelta: 0,
          smartsDelta: 0,
          feedback:
            'That slip was worth money at tax time. Keep every slip you receive, even the ones that look boring.',
          lesson: 'Keep every tax slip — some are worth money at filing time.',
        },
      ],
    },
    {
      id: 'sim-bad-luck',
      monthLabel: 'Month 11 — Bad luck',
      prompt: 'An unexpected dental bill of $600 hits. How are you set up to handle it?',
      categoryId: 'saving-and-investing',
      order: 10,
      options: [
        {
          id: 'sim-dental-savings',
          label: 'Cover it from your savings cushion',
          cashDelta: -600,
          smartsDelta: 10,
          feedback: 'This is exactly why you kept a cushion. No debt, no drama.',
          lesson: 'A savings cushion turns emergencies into inconveniences.',
        },
        {
          id: 'sim-dental-ignore',
          label: 'Ignore it and hope it goes away',
          cashDelta: -750,
          debtDelta: 150,
          smartsDelta: 0,
          feedback:
            'Unpaid bills can grow with fees or go to collections, hurting your credit. Better to plan for surprises.',
          lesson: 'Ignoring bills can add fees and damage your credit.',
        },
      ],
    },
    {
      id: 'sim-year-end',
      monthLabel: 'Month 12 — Year-end',
      prompt: "You've got some money left over as the year closes. What do you do with it?",
      categoryId: 'tfsa-and-rrsp',
      order: 11,
      options: [
        {
          id: 'sim-yearend-invest',
          label: 'Keep an emergency fund and invest the rest in a TFSA',
          cashDelta: 300,
          savingsDelta: 300,
          smartsDelta: 20,
          feedback:
            'Textbook. A cushion for surprises plus tax-free growth is a strong foundation for year two. (+$300 growth.)',
          lesson: 'Keep an emergency fund, then invest the rest to grow.',
        },
        {
          id: 'sim-yearend-idle',
          label: 'Leave it all sitting in chequing',
          cashDelta: 0,
          smartsDelta: 5,
          feedback:
            "Safe, but idle cash doesn't grow. Even a TFSA savings account would earn a little tax-free.",
          lesson: 'Idle cash does not grow — put savings where they earn.',
        },
      ],
    },
  ],
};
