import type { GlossaryTerm } from './types';

/** Glossary, migrated from part 7 of the website's beginner guide. */
export const glossary: GlossaryTerm[] = [
  {
    term: 'CRA',
    definition:
      'The Canada Revenue Agency, the group in charge of taxes in Canada. It collects taxes and pays out most benefits and credits.',
    categoryId: 'tax-basics',
  },
  {
    term: 'SIN',
    definition:
      'Social Insurance Number, the personal number you need to file taxes and to open accounts like a TFSA.',
    categoryId: 'tax-basics',
  },
  {
    term: 'Gross pay',
    definition: 'The full amount you earn before anything is taken off.',
    categoryId: 'your-paycheque',
  },
  {
    term: 'Net pay',
    definition:
      'Your take home pay — the amount that actually reaches your bank account after deductions.',
    categoryId: 'your-paycheque',
  },
  {
    term: 'CPP',
    definition: 'The Canada Pension Plan, savings toward income for when you retire.',
    categoryId: 'your-paycheque',
  },
  {
    term: 'EI',
    definition: 'Employment Insurance, support if you lose your job.',
    categoryId: 'your-paycheque',
  },
  {
    term: 'NETFILE',
    definition: 'The CRA service for filing your taxes online through certified software.',
    categoryId: 'deadlines-and-penalties',
  },
  {
    term: 'Refund',
    definition: 'Money you get back when too much tax was taken off during the year.',
    categoryId: 'tax-basics',
  },
  {
    term: 'CGEB (formerly GST/HST credit)',
    definition: 'A tax free payment that helps lower income people with sales tax.',
    categoryId: 'credits-and-benefits',
  },
  {
    term: 'TFSA',
    definition:
      'Tax Free Savings Account. Money grows and comes out tax free, but contributions are not deductible.',
    categoryId: 'tfsa-and-rrsp',
  },
  {
    term: 'RRSP',
    definition:
      'Registered Retirement Savings Plan. Contributions lower your tax now, and withdrawals are taxed later.',
    categoryId: 'tfsa-and-rrsp',
  },
  {
    term: 'T4',
    definition: 'The slip showing money you earned from a job and the tax already taken off.',
    categoryId: 'slips-and-documents',
  },
  {
    term: 'T4A',
    definition:
      'A slip covering other income like scholarships, and some self employed or pension income.',
    categoryId: 'slips-and-documents',
  },
  {
    term: 'T5',
    definition: 'A slip showing interest or investment income, such as from a savings account.',
    categoryId: 'slips-and-documents',
  },
  {
    term: 'T2202',
    definition: 'A certificate showing the tuition you paid as a post-secondary student.',
    categoryId: 'slips-and-documents',
  },
  {
    term: 'TD1',
    definition:
      'The form you fill in when you start a job. It tells your employer how much tax to take off your pay.',
    categoryId: 'slips-and-documents',
  },
  {
    term: 'Deduction',
    definition: 'An amount that comes off your income before tax is calculated.',
    categoryId: 'credits-and-benefits',
  },
  {
    term: 'Credit',
    definition: 'An amount that reduces the tax you owe after it has been calculated.',
    categoryId: 'credits-and-benefits',
  },
  {
    term: 'Tax bracket',
    definition:
      'A slice of income taxed at its own rate. Only the dollars inside a higher bracket are taxed at that higher rate.',
    categoryId: 'tax-basics',
  },
  {
    term: 'Emergency fund',
    definition:
      'Savings kept aside for surprise costs, so an emergency does not become high interest debt.',
    categoryId: 'saving-and-investing',
  },
];

export const glossaryTerm = (term: string) =>
  glossary.find((g) => g.term.toLowerCase() === term.toLowerCase());
