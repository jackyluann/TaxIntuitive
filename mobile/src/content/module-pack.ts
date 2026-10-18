// Adapted from the user-supplied Tax Intuitive Quizzes and Learning Modules (2026-10-18).
// See CONTENT-IMPORT-2026-10-18.md for corrections and provenance.
import type { Lesson, Quiz, QuizQuestion } from './types';

export const moduleLessons: Lesson[] = [
  {
    "id": "lesson-module-5",
    "slug": "decoding-your-pay-stub",
    "title": "Module 5: Decoding Your Pay Stub",
    "categoryId": "your-paycheque",
    "kind": "lesson",
    "summary": "Your paycheque is smaller than hours times wage. Here is exactly where the money went.",
    "readingMinutes": 4,
    "body": [
      {
        "type": "heading",
        "text": "Gross vs net"
      },
      {
        "type": "paragraph",
        "text": "Gross pay is what you earned. Net pay is what lands in your account after deductions."
      },
      {
        "type": "heading",
        "text": "The big three deductions"
      },
      {
        "type": "paragraph",
        "text": "Income tax, CPP pension contributions and EI premiums commonly reduce pay. These lessons use CPP and non-Quebec EI rules; Quebec has QPP and different EI premiums."
      },
      {
        "type": "heading",
        "text": "Age matters"
      },
      {
        "type": "paragraph",
        "text": "CPP deductions generally begin the month after you turn 18 on pensionable pay, subject to the basic exemption. EI has no minimum age and applies to insurable earnings from the first dollar, up to the annual maximum."
      },
      {
        "type": "heading",
        "text": "The TD1 form"
      },
      {
        "type": "paragraph",
        "text": "You fill it out when you start a job. It tells your employer how much tax to hold back."
      },
      {
        "type": "table",
        "headers": [
          "2026 payroll item",
          "Reference value (outside Quebec)"
        ],
        "rows": [
          [
            "CPP employee rate",
            "5.95% on pensionable earnings above the $3,500 annual exemption up to $74,600; CPP2 is separate"
          ],
          [
            "CPP2",
            "4% on the pensionable earnings band above $74,600 up to $85,000"
          ],
          [
            "EI employee rate",
            "1.63% on insurable earnings up to $68,900"
          ]
        ]
      },
      {
        "type": "example",
        "title": "Ava's shrinking paycheque",
        "text": "Ava turned 18 in March. Her April paycheque was smaller even though she worked the same hours. What changed?\n\nAssuming pensionable earnings exceed the applicable exemption, CPP deductions started in April, the month after Ava turned 18. CPP contributions help build pension entitlement."
      }
    ],
    "keyTakeaways": [
      "Gross vs net. Gross pay is what you earned. Net pay is what lands in your account after deductions.",
      "The big three deductions. Income tax, CPP pension contributions and EI premiums commonly reduce pay. These lessons use CPP and non-Quebec EI rules; Quebec has QPP and different EI premiums.",
      "Age matters. CPP deductions generally begin the month after you turn 18 on pensionable pay, subject to the basic exemption. EI has no minimum age and applies to insurable earnings from the first dollar, up to the annual maximum.",
      "The TD1 form. You fill it out when you start a job. It tells your employer how much tax to hold back."
    ],
    "officialSources": [
      {
        "label": "CRA guidance",
        "url": "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032bc-july/t4032bc-july-general-information.html"
      }
    ],
    "lastReviewed": "2026-10-18",
    "needsVerification": true,
    "relatedQuizId": "quiz-module-5",
    "xp": 10,
    "order": 25
  },
  {
    "id": "lesson-module-6",
    "slug": "how-tax-brackets-really-work",
    "title": "Module 6: How Tax Brackets Really Work",
    "categoryId": "tax-basics",
    "kind": "lesson",
    "summary": "A higher tax bracket only affects the next slice of income. Learn what a raise really changes.",
    "readingMinutes": 4,
    "body": [
      {
        "type": "heading",
        "text": "Brackets are buckets"
      },
      {
        "type": "paragraph",
        "text": "Each rate only applies to the dollars inside that bucket, not your whole income."
      },
      {
        "type": "heading",
        "text": "Marginal rate"
      },
      {
        "type": "paragraph",
        "text": "The rate on your next dollar of taxable income. In 2026 the first federal bracket is 14% up to $58,523; the next is 20.5% up to $117,045. Higher brackets also exist."
      },
      {
        "type": "heading",
        "text": "Average rate"
      },
      {
        "type": "paragraph",
        "text": "Total income tax divided by income. In a simple progressive-bracket example it is below the marginal rate when some income falls into lower brackets. The two can be equal if all taxable dollars face one rate before credits."
      },
      {
        "type": "heading",
        "text": "Two layers"
      },
      {
        "type": "paragraph",
        "text": "You pay federal tax plus provincial tax (BC has its own brackets). Lessons here use federal numbers only."
      },
      {
        "type": "table",
        "headers": [
          "2026 federal item",
          "Reference value"
        ],
        "rows": [
          [
            "Maximum basic personal amount",
            "$16,452; reduced at higher incomes and subject to special rules"
          ],
          [
            "First bracket",
            "14% up to $58,523 of taxable income"
          ],
          [
            "Second bracket",
            "20.5% above $58,523 up to $117,045"
          ]
        ]
      },
      {
        "type": "example",
        "title": "Noah's \"bad\" raise",
        "text": "Noah earns $58,000 and is offered a raise to $60,000. A coworker warns him it will bump him into a higher bracket and he will lose money. Should he turn it down?\n\nA higher bracket alone does not make the whole income face the higher rate. In this simplified taxable-income example, $523 is taxed at 14% and $1,477 at 20.5%: $375.61 extra federal tax, leaving $1,624.39 of the raise before provincial tax, CPP, EI and any benefit changes."
      }
    ],
    "keyTakeaways": [
      "Brackets are buckets. Each rate only applies to the dollars inside that bucket, not your whole income.",
      "Marginal rate. The rate on your next dollar of taxable income. In 2026 the first federal bracket is 14% up to $58,523; the next is 20.5% up to $117,045. Higher brackets also exist.",
      "Average rate. Total income tax divided by income. In a simple progressive-bracket example it is below the marginal rate when some income falls into lower brackets. The two can be equal if all taxable dollars face one rate before credits.",
      "Two layers. You pay federal tax plus provincial tax (BC has its own brackets). Lessons here use federal numbers only."
    ],
    "officialSources": [
      {
        "label": "CRA guidance 1",
        "url": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html"
      },
      {
        "label": "CRA guidance 2",
        "url": "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/income-tax/reducing-remuneration-subject-income-tax.html"
      }
    ],
    "lastReviewed": "2026-10-18",
    "needsVerification": true,
    "relatedQuizId": "quiz-module-6",
    "xp": 10,
    "order": 26
  },
  {
    "id": "lesson-module-7",
    "slug": "side-hustles-and-gig-income",
    "title": "Module 7: Side Hustles and Gig Income",
    "categoryId": "employment-and-gig-income",
    "kind": "lesson",
    "summary": "Tutoring, reselling, babysitting, content creation. If you earn it, the CRA cares about it.",
    "readingMinutes": 4,
    "body": [
      {
        "type": "heading",
        "text": "Cash still counts"
      },
      {
        "type": "paragraph",
        "text": "Business earnings from tutoring, lawn mowing and online work must be reported even without a T4. A transfer between your own accounts or a personal gift is not automatically business income."
      },
      {
        "type": "heading",
        "text": "Profit, not sales"
      },
      {
        "type": "paragraph",
        "text": "Report gross business revenue and eligible expenses; net profit is the business income used in your tax calculation. Personal expenses are not deductible."
      },
      {
        "type": "heading",
        "text": "Keep receipts"
      },
      {
        "type": "paragraph",
        "text": "Track revenue, eligible expenses and business use of a vehicle. Generally keep tax records for six years from the end of the last tax year they relate to; some records must be kept longer."
      },
      {
        "type": "heading",
        "text": "The $30,000 test"
      },
      {
        "type": "paragraph",
        "text": "For most businesses, mandatory GST/HST registration depends on worldwide taxable supplies, including associates, exceeding $30,000 in one calendar quarter or over four consecutive quarters. Timing differs between these tests. Exempt tutoring and special rules such as commercial ride-sharing need separate treatment."
      },
      {
        "type": "example",
        "title": "Ethan's tutoring business",
        "text": "Ethan, 19, earned $6,000 tutoring math by e-transfer and spent $400 on textbooks and ads. He also has a T4 from a summer job. Does he need to report the tutoring?\n\nYes. Report $6,000 of gross tutoring revenue and $400 of eligible expenses, for $5,600 net business income, alongside the T4. These amounts alone do not exceed the usual GST/HST small-supplier threshold. Some curriculum-based tutoring is exempt; do not assume all tutoring is taxable."
      }
    ],
    "keyTakeaways": [
      "Cash still counts. Business earnings from tutoring, lawn mowing and online work must be reported even without a T4. A transfer between your own accounts or a personal gift is not automatically business income.",
      "Profit, not sales. Report gross business revenue and eligible expenses; net profit is the business income used in your tax calculation. Personal expenses are not deductible.",
      "Keep receipts. Track revenue, eligible expenses and business use of a vehicle. Generally keep tax records for six years from the end of the last tax year they relate to; some records must be kept longer.",
      "The $30,000 test. For most businesses, mandatory GST/HST registration depends on worldwide taxable supplies, including associates, exceeding $30,000 in one calendar quarter or over four consecutive quarters. Timing differs between these tests. Exempt tutoring and special rules such as commercial ride-sharing need separate treatment."
    ],
    "officialSources": [
      {
        "label": "CRA guidance 1",
        "url": "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/when-register-charge.html"
      },
      {
        "label": "CRA guidance 2",
        "url": "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4002.html"
      }
    ],
    "lastReviewed": "2026-10-18",
    "needsVerification": true,
    "relatedQuizId": "quiz-module-7",
    "xp": 10,
    "order": 27
  },
  {
    "id": "lesson-module-8",
    "slug": "free-money-from-filing",
    "title": "Module 8: Free Money from Filing",
    "categoryId": "credits-and-benefits",
    "kind": "lesson",
    "summary": "The government cannot send you money it does not know you are owed. Filing is how you tell it.",
    "readingMinutes": 4,
    "body": [
      {
        "type": "heading",
        "text": "Refunds of overpaid deductions"
      },
      {
        "type": "paragraph",
        "text": "If your employer withheld more tax, CPP or EI than you owed, filing gets it back."
      },
      {
        "type": "heading",
        "text": "Small earners get EI back"
      },
      {
        "type": "paragraph",
        "text": "If your insurable earnings for the year were $2,000 or less, your EI premiums are refunded."
      },
      {
        "type": "heading",
        "text": "Quarterly benefits"
      },
      {
        "type": "paragraph",
        "text": "The Canada Groceries and Essentials Benefit (CGEB) replaced the GST/HST credit in July 2026. It is tax-free and income-tested. Generally eligibility starts at 19, with exceptions for a spouse or common-law partner or a parent living with their child. File the year before you turn 19."
      },
      {
        "type": "heading",
        "text": "Canada Workers Benefit"
      },
      {
        "type": "paragraph",
        "text": "A refundable credit for eligible lower-income workers. Age, residency and family rules apply. Full-time students for more than 13 weeks generally do not qualify unless they have an eligible dependant."
      },
      {
        "type": "example",
        "title": "Sam skips filing",
        "text": "Sam, 18, earned $9,000 at a grocery store and $450 in income tax was withheld. He figures he earned too little to bother filing. What is he missing?\n\nAssuming Sam is a full-year Canadian resident with only that income and no offsets, he would generally recover the $450 withheld income tax. Filing also lets the CRA assess CGEB eligibility as he approaches 19 and establishes earned income for future RRSP room; benefit payment is not guaranteed."
      }
    ],
    "keyTakeaways": [
      "Refunds of overpaid deductions. If your employer withheld more tax, CPP or EI than you owed, filing gets it back.",
      "Small earners get EI back. If your insurable earnings for the year were $2,000 or less, your EI premiums are refunded.",
      "Quarterly benefits. The Canada Groceries and Essentials Benefit (CGEB) replaced the GST/HST credit in July 2026. It is tax-free and income-tested. Generally eligibility starts at 19, with exceptions for a spouse or common-law partner or a parent living with their child. File the year before you turn 19.",
      "Canada Workers Benefit. A refundable credit for eligible lower-income workers. Age, residency and family rules apply. Full-time students for more than 13 weeks generally do not qualify unless they have an eligible dependant."
    ],
    "officialSources": [
      {
        "label": "CRA guidance 1",
        "url": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/educational-programs/accessing-benefits-credits.html"
      },
      {
        "label": "CRA guidance 2",
        "url": "https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-groceries-essentials-benefit.html"
      }
    ],
    "lastReviewed": "2026-10-18",
    "needsVerification": true,
    "relatedQuizId": "quiz-module-8",
    "xp": 10,
    "order": 28
  },
  {
    "id": "lesson-module-9",
    "slug": "fhsa-rrsp-and-big-goals",
    "title": "Module 9: FHSA, RRSP and Big Goals",
    "categoryId": "tfsa-and-rrsp",
    "kind": "lesson",
    "summary": "Saving for a first home or retirement at 18 sounds early. That is exactly why it works.",
    "readingMinutes": 4,
    "body": [
      {
        "type": "heading",
        "text": "FHSA"
      },
      {
        "type": "paragraph",
        "text": "Eligible Canadian-resident first-time home buyers can generally open one from 18, but must be 19 where local contract law requires it, including BC. Contributions can be deductible and qualifying home withdrawals tax-free."
      },
      {
        "type": "heading",
        "text": "FHSA limits"
      },
      {
        "type": "paragraph",
        "text": "Initial participation room is $8,000 and the lifetime limit is $40,000. Room starts when the first account opens; unused carryforward is capped at $8,000. Opening also starts the maximum participation period, generally 15 years, with other closing triggers."
      },
      {
        "type": "heading",
        "text": "RRSP room"
      },
      {
        "type": "paragraph",
        "text": "New room is generally based on 18% of the previous year's earned income, subject to the annual dollar limit and pension adjustments. Check your CRA deduction limit before contributing."
      },
      {
        "type": "heading",
        "text": "Deduct later"
      },
      {
        "type": "paragraph",
        "text": "You can contribute to an RRSP now and save the deduction for a future year when your tax rate is higher."
      },
      {
        "type": "table",
        "headers": [
          "2026 account limit",
          "Amount"
        ],
        "rows": [
          [
            "TFSA annual dollar limit",
            "$7,000; your available room also depends on eligibility, contributions and withdrawals"
          ],
          [
            "FHSA annual participation room",
            "$8,000 when the first FHSA opens; limited unused room can carry forward"
          ],
          [
            "FHSA lifetime limit",
            "$40,000"
          ]
        ]
      },
      {
        "type": "example",
        "title": "Chloe's first $2,000",
        "text": "Chloe, 19, has $2,000 saved and wants to buy a condo in about 8 years. She makes $14,000 a year, so she pays almost no tax right now. FHSA or TFSA first?\n\nOne option, if Chloe meets FHSA eligibility rules, is to open one to start participation room and defer the deduction to a later year. Opening also starts the maximum participation period, generally 15 years. A TFSA provides flexible withdrawals. Compare her emergency needs and home-buying plans before choosing."
      }
    ],
    "keyTakeaways": [
      "FHSA. Eligible Canadian-resident first-time home buyers can generally open one from 18, but must be 19 where local contract law requires it, including BC. Contributions can be deductible and qualifying home withdrawals tax-free.",
      "FHSA limits. Initial participation room is $8,000 and the lifetime limit is $40,000. Room starts when the first account opens; unused carryforward is capped at $8,000. Opening also starts the maximum participation period, generally 15 years, with other closing triggers.",
      "RRSP room. New room is generally based on 18% of the previous year's earned income, subject to the annual dollar limit and pension adjustments. Check your CRA deduction limit before contributing.",
      "Deduct later. You can contribute to an RRSP now and save the deduction for a future year when your tax rate is higher."
    ],
    "officialSources": [
      {
        "label": "CRA guidance 1",
        "url": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account/opening-your-fhsas.html"
      },
      {
        "label": "CRA guidance 2",
        "url": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account/contributing-your-fhsa.html"
      },
      {
        "label": "CRA guidance 3",
        "url": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/contributions.html"
      }
    ],
    "lastReviewed": "2026-10-18",
    "needsVerification": true,
    "relatedQuizId": "quiz-module-9",
    "xp": 10,
    "order": 29
  },
  {
    "id": "lesson-module-10",
    "slug": "moving-out-for-school",
    "title": "Module 10: Moving Out for School",
    "categoryId": "slips-and-documents",
    "kind": "lesson",
    "summary": "University comes with new tax slips, new credits and a few traps. Here is your first-year survival kit.",
    "readingMinutes": 4,
    "body": [
      {
        "type": "heading",
        "text": "The T2202"
      },
      {
        "type": "paragraph",
        "text": "Your school issues it each year. It shows the eligible tuition you can claim."
      },
      {
        "type": "heading",
        "text": "Use it, transfer it or carry it forward"
      },
      {
        "type": "paragraph",
        "text": "First claim the tuition amount required to reduce your own federal tax. Up to $5,000 of current-year tuition, minus the amount you need, may be transferred to an eligible relative. This is a tuition amount, not $5,000 cash. Prior-year carryforwards cannot be transferred."
      },
      {
        "type": "heading",
        "text": "Scholarships"
      },
      {
        "type": "paragraph",
        "text": "A scholarship connected to a qualifying full-time program may be fully exempt. Enter the T4A accurately in tax software and apply the exemption; only the taxable portion belongs on line 13010, not an automatically taxable full amount."
      },
      {
        "type": "heading",
        "text": "RESP money"
      },
      {
        "type": "paragraph",
        "text": "Growth and grants paid out to you count as your income, though your low student income often means little or no tax."
      },
      {
        "type": "example",
        "title": "Lucas and his tuition credits",
        "text": "Lucas paid $7,000 in tuition and earned only $4,000 from a part-time job, so he owes no tax. His mom asks if she can use his credits. What are his options?\n\nAssuming the $7,000 is eligible current-year tuition and none is needed against his own federal tax, Lucas can designate up to $5,000 to an eligible parent and carry the other $2,000 forward, or carry all $7,000 forward. The transfer is a tuition amount, not a $5,000 refund. He must file Schedule 11."
      }
    ],
    "keyTakeaways": [
      "The T2202. Your school issues it each year. It shows the eligible tuition you can claim.",
      "Use it, transfer it or carry it forward. First claim the tuition amount required to reduce your own federal tax. Up to $5,000 of current-year tuition, minus the amount you need, may be transferred to an eligible relative. This is a tuition amount, not $5,000 cash. Prior-year carryforwards cannot be transferred.",
      "Scholarships. A scholarship connected to a qualifying full-time program may be fully exempt. Enter the T4A accurately in tax software and apply the exemption; only the taxable portion belongs on line 13010, not an automatically taxable full amount.",
      "RESP money. Growth and grants paid out to you count as your income, though your low student income often means little or no tax."
    ],
    "officialSources": [
      {
        "label": "CRA guidance 1",
        "url": "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/p105/p105-students-income-tax.html"
      },
      {
        "label": "CRA guidance 2",
        "url": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-21900-moving-expenses.html"
      }
    ],
    "lastReviewed": "2026-10-18",
    "needsVerification": true,
    "relatedQuizId": "quiz-module-10",
    "xp": 10,
    "order": 30
  },
  {
    "id": "lesson-module-11",
    "slug": "cra-scams-deadlines-and-mistakes",
    "title": "Module 11: CRA Scams, Deadlines and Mistakes",
    "categoryId": "deadlines-and-penalties",
    "kind": "lesson",
    "summary": "The real CRA will never text you a gift card demand. Learn to spot the fakes and dodge the fees.",
    "readingMinutes": 4,
    "body": [
      {
        "type": "heading",
        "text": "Scam red flags"
      },
      {
        "type": "paragraph",
        "text": "The CRA does not demand gift cards or cryptocurrency and does not threaten immediate arrest to force payment. Verify suspicious contact independently through official CRA contact details."
      },
      {
        "type": "heading",
        "text": "Deadlines"
      },
      {
        "type": "paragraph",
        "text": "The usual individual filing and payment deadline is April 30. Most self-employed individuals and their spouses or common-law partners have until June 15 to file, but payment is still normally due April 30. Weekend and public-holiday rules can shift dates; check the relevant filing year."
      },
      {
        "type": "heading",
        "text": "Late filing"
      },
      {
        "type": "paragraph",
        "text": "The standard penalty when a balance is owing is 5% of the unpaid balance plus 1% per full month late, up to 12 months. Repeat late filing can have higher penalties, and late-payment interest is separate."
      },
      {
        "type": "heading",
        "text": "Notice of Assessment"
      },
      {
        "type": "paragraph",
        "text": "Read the CRA summary after you file, including any changes and your available RRSP deduction limit. Generally keep supporting tax records for six years; some must be retained longer."
      },
      {
        "type": "example",
        "title": "Mia's suspicious text",
        "text": "Mia gets a text saying she has a $437 CRA refund waiting, with a link to \"claim it now\" by entering her SIN and banking info. What should she do?\n\nDo not click or enter personal information. Visit CRA My Account through an independently verified official address and report the suspicious message to the Canadian Anti-Fraud Centre."
      }
    ],
    "keyTakeaways": [
      "Scam red flags. The CRA does not demand gift cards or cryptocurrency and does not threaten immediate arrest to force payment. Verify suspicious contact independently through official CRA contact details.",
      "Deadlines. The usual individual filing and payment deadline is April 30. Most self-employed individuals and their spouses or common-law partners have until June 15 to file, but payment is still normally due April 30. Weekend and public-holiday rules can shift dates; check the relevant filing year.",
      "Late filing. The standard penalty when a balance is owing is 5% of the unpaid balance plus 1% per full month late, up to 12 months. Repeat late filing can have higher penalties, and late-payment interest is separate.",
      "Notice of Assessment. Read the CRA summary after you file, including any changes and your available RRSP deduction limit. Generally keep supporting tax records for six years; some must be retained longer."
    ],
    "officialSources": [
      {
        "label": "CRA guidance 1",
        "url": "https://www.canada.ca/en/revenue-agency/campaigns/fraud-scams.html"
      },
      {
        "label": "CRA guidance 2",
        "url": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/interest-penalties/late-filing-penalty.html"
      },
      {
        "label": "CRA guidance 3",
        "url": "https://www.canada.ca/en/services/taxes/income-tax/personal-income-tax/after-you-file/change-return.html"
      }
    ],
    "lastReviewed": "2026-10-18",
    "needsVerification": true,
    "relatedQuizId": "quiz-module-11",
    "xp": 10,
    "order": 31
  }
];

export const moduleQuizzes: Quiz[] = [
  {
    "id": "quiz-module-5",
    "slug": "decoding-your-pay-stub-quiz",
    "title": "Decoding Your Pay Stub",
    "description": "Module 5 · Five questions with explanations. Read the lesson, then test your understanding.",
    "emoji": "school-outline",
    "kind": "topic",
    "categoryId": "your-paycheque",
    "questionIds": [
      "q-module-5-1",
      "q-module-5-2",
      "q-module-5-3",
      "q-module-5-4",
      "q-module-5-5"
    ],
    "xpPerCorrect": 4,
    "order": 25
  },
  {
    "id": "quiz-module-6",
    "slug": "how-tax-brackets-really-work-quiz",
    "title": "How Tax Brackets Really Work",
    "description": "Module 6 · Five questions with explanations. Read the lesson, then test your understanding.",
    "emoji": "school-outline",
    "kind": "topic",
    "categoryId": "tax-basics",
    "questionIds": [
      "q-module-6-1",
      "q-module-6-2",
      "q-module-6-3",
      "q-module-6-4",
      "q-module-6-5"
    ],
    "xpPerCorrect": 4,
    "order": 26
  },
  {
    "id": "quiz-module-7",
    "slug": "side-hustles-and-gig-income-quiz",
    "title": "Side Hustles and Gig Income",
    "description": "Module 7 · Five questions with explanations. Read the lesson, then test your understanding.",
    "emoji": "school-outline",
    "kind": "topic",
    "categoryId": "employment-and-gig-income",
    "questionIds": [
      "q-module-7-1",
      "q-module-7-2",
      "q-module-7-3",
      "q-module-7-4",
      "q-module-7-5"
    ],
    "xpPerCorrect": 4,
    "order": 27
  },
  {
    "id": "quiz-module-8",
    "slug": "free-money-from-filing-quiz",
    "title": "Free Money from Filing",
    "description": "Module 8 · Five questions with explanations. Read the lesson, then test your understanding.",
    "emoji": "school-outline",
    "kind": "topic",
    "categoryId": "credits-and-benefits",
    "questionIds": [
      "q-module-8-1",
      "q-module-8-2",
      "q-module-8-3",
      "q-module-8-4",
      "q-module-8-5"
    ],
    "xpPerCorrect": 4,
    "order": 28
  },
  {
    "id": "quiz-module-9",
    "slug": "fhsa-rrsp-and-big-goals-quiz",
    "title": "FHSA, RRSP and Big Goals",
    "description": "Module 9 · Five questions with explanations. Read the lesson, then test your understanding.",
    "emoji": "school-outline",
    "kind": "topic",
    "categoryId": "tfsa-and-rrsp",
    "questionIds": [
      "q-module-9-1",
      "q-module-9-2",
      "q-module-9-3",
      "q-module-9-4",
      "q-module-9-5"
    ],
    "xpPerCorrect": 4,
    "order": 29
  },
  {
    "id": "quiz-module-10",
    "slug": "moving-out-for-school-quiz",
    "title": "Moving Out for School",
    "description": "Module 10 · Five questions with explanations. Read the lesson, then test your understanding.",
    "emoji": "school-outline",
    "kind": "topic",
    "categoryId": "slips-and-documents",
    "questionIds": [
      "q-module-10-1",
      "q-module-10-2",
      "q-module-10-3",
      "q-module-10-4",
      "q-module-10-5"
    ],
    "xpPerCorrect": 4,
    "order": 30
  },
  {
    "id": "quiz-module-11",
    "slug": "cra-scams-deadlines-and-mistakes-quiz",
    "title": "CRA Scams, Deadlines and Mistakes",
    "description": "Module 11 · Five questions with explanations. Read the lesson, then test your understanding.",
    "emoji": "school-outline",
    "kind": "topic",
    "categoryId": "deadlines-and-penalties",
    "questionIds": [
      "q-module-11-1",
      "q-module-11-2",
      "q-module-11-3",
      "q-module-11-4",
      "q-module-11-5"
    ],
    "xpPerCorrect": 4,
    "order": 31
  },
  {
    "id": "quiz-myth-busters",
    "slug": "myth-busters",
    "title": "Myth Busters",
    "description": "Ten true-or-false tax myths. Find the catch, then learn why.",
    "emoji": "bulb-outline",
    "kind": "topic",
    "questionIds": [
      "q-myth-1",
      "q-myth-2",
      "q-myth-3",
      "q-myth-4",
      "q-myth-5",
      "q-myth-6",
      "q-myth-7",
      "q-myth-8",
      "q-myth-9",
      "q-myth-10"
    ],
    "xpPerCorrect": 4,
    "order": 32
  }
];

export const moduleQuestions: QuizQuestion[] = [
  {
    "id": "q-module-5-1",
    "categoryId": "your-paycheque",
    "prompt": "You worked 20 hours at $17.85. Your stub shows gross pay of $357 and a deposit of $331. What is your net pay?",
    "options": [
      "$357",
      "$331",
      "$26"
    ],
    "answerIndex": 1,
    "explanation": "Net pay is $331. The $26 difference is deductions; read the stub to identify which deductions apply.",
    "teachesLessonId": "lesson-module-5",
    "difficulty": "easy"
  },
  {
    "id": "q-module-5-2",
    "categoryId": "your-paycheque",
    "prompt": "You are 16 with a part-time job. Which deduction should NOT appear on your stub?",
    "options": [
      "EI",
      "Income tax",
      "CPP"
    ],
    "answerIndex": 2,
    "explanation": "CPP generally starts the month after age 18. Ask payroll to correct mistaken deductions; any remaining overpayment can be reconciled when filing.",
    "teachesLessonId": "lesson-module-5",
    "difficulty": "medium"
  },
  {
    "id": "q-module-5-3",
    "categoryId": "your-paycheque",
    "prompt": "True or false: EI is only deducted once you earn over $3,500 a year.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "That $3,500 exemption is for CPP. EI comes off from the first dollar you earn.",
    "teachesLessonId": "lesson-module-5",
    "difficulty": "medium"
  },
  {
    "id": "q-module-5-4",
    "categoryId": "your-paycheque",
    "prompt": "What is the TD1 form for?",
    "options": [
      "Filing your tax return",
      "Telling your employer how much tax to withhold",
      "Applying for EI"
    ],
    "answerIndex": 1,
    "explanation": "It sets your withholding. Most students just claim the basic personal amount.",
    "teachesLessonId": "lesson-module-5",
    "difficulty": "medium"
  },
  {
    "id": "q-module-5-5",
    "categoryId": "your-paycheque",
    "prompt": "Jordan has two jobs at the same time, total income exceeds his basic personal amount, and he claims that amount on both TD1 forms. What risk does this create?",
    "options": [
      "A bigger refund",
      "He owes money",
      "Nothing changes"
    ],
    "answerIndex": 1,
    "explanation": "Both employers may withhold too little tax. A balance may be owing; the final result depends on total income, deductions and credits.",
    "teachesLessonId": "lesson-module-5",
    "difficulty": "hard"
  },
  {
    "id": "q-module-6-1",
    "categoryId": "tax-basics",
    "prompt": "True or false: if your income crosses into a higher bracket, all your income is taxed at the higher rate.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "Only the dollars above the line get the higher rate.",
    "teachesLessonId": "lesson-module-6",
    "difficulty": "easy"
  },
  {
    "id": "q-module-6-2",
    "categoryId": "tax-basics",
    "prompt": "Which rate tells you how much tax you will pay on one extra hour of work?",
    "options": [
      "Average rate",
      "Marginal rate",
      "Basic rate"
    ],
    "answerIndex": 1,
    "explanation": "The marginal rate applies to your next dollar earned.",
    "teachesLessonId": "lesson-module-6",
    "difficulty": "medium"
  },
  {
    "id": "q-module-6-3",
    "categoryId": "tax-basics",
    "prompt": "For a full-year Canadian resident entitled to the maximum 2026 federal basic personal amount, about how much taxable income can that credit offset?",
    "options": [
      "$5,000",
      "$16,452",
      "$58,523"
    ],
    "answerIndex": 1,
    "explanation": "The maximum 2026 federal basic personal amount is $16,452. This is a non-refundable federal credit, not an exemption from payroll deductions or provincial tax; special and high-income rules apply.",
    "teachesLessonId": "lesson-module-6",
    "difficulty": "medium"
  },
  {
    "id": "q-module-6-4",
    "categoryId": "tax-basics",
    "prompt": "In a simple 2026 federal bracket calculation, some income is taxed at 14% and the next dollar at 20.5%. Compared with 20.5%, is the average rate higher, lower or the same?",
    "options": [
      "Higher",
      "Always exactly the same",
      "Lower in this simple bracket example"
    ],
    "answerIndex": 2,
    "explanation": "Lower: part of the income is taxed in the lower bracket. Credits can reduce the effective rate further.",
    "teachesLessonId": "lesson-module-6",
    "difficulty": "medium"
  },
  {
    "id": "q-module-6-5",
    "categoryId": "tax-basics",
    "prompt": "Assuming identical total taxable income, deductions and credits, who owes more final federal income tax: one $60,000 job or two $30,000 jobs?",
    "options": [
      "The person with one job",
      "The same, with identical deductions and credits",
      "The person with two jobs"
    ],
    "answerIndex": 1,
    "explanation": "The final federal income tax is the same under those assumptions. Payroll withholding may differ.",
    "teachesLessonId": "lesson-module-6",
    "difficulty": "hard"
  },
  {
    "id": "q-module-7-1",
    "categoryId": "employment-and-gig-income",
    "prompt": "True or false: tips from a restaurant job are tax-free.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "Tips are income and must be reported, whether cash or card.",
    "teachesLessonId": "lesson-module-7",
    "difficulty": "easy"
  },
  {
    "id": "q-module-7-2",
    "categoryId": "employment-and-gig-income",
    "prompt": "Your jewelry business has $4,000 of revenue and $1,000 of eligible material expenses. What is the net profit?",
    "options": [
      "$4,000",
      "$3,000",
      "$0, it is a hobby"
    ],
    "answerIndex": 1,
    "explanation": "Net profit is $3,000. On the business statement, report both the $4,000 gross revenue and the $1,000 eligible expenses.",
    "teachesLessonId": "lesson-module-7",
    "difficulty": "medium"
  },
  {
    "id": "q-module-7-3",
    "categoryId": "employment-and-gig-income",
    "prompt": "A brand sends you a free $300 hoodie in exchange for a TikTok post. Is that taxable?",
    "options": [
      "No, because no cash changed hands",
      "Only if the hoodie is sold later",
      "Yes, its fair market value is business income"
    ],
    "answerIndex": 2,
    "explanation": "Yes. Products received in exchange for promotion count as income at their fair value.",
    "teachesLessonId": "lesson-module-7",
    "difficulty": "medium"
  },
  {
    "id": "q-module-7-4",
    "categoryId": "employment-and-gig-income",
    "prompt": "You sell your own old clothes on Vinted for less than you paid. Do you owe tax?",
    "options": [
      "Only if payment is by e-transfer",
      "Generally no taxable gain on ordinary used clothes sold at a loss",
      "Yes, tax is due on every personal sale"
    ],
    "answerIndex": 1,
    "explanation": "No. Selling personal items at a loss is not income. Buying items to resell for profit is a business.",
    "teachesLessonId": "lesson-module-7",
    "difficulty": "medium"
  },
  {
    "id": "q-module-7-5",
    "categoryId": "employment-and-gig-income",
    "prompt": "A self-employed 20-year-old nets $15,000. Why is her CPP higher than a regular employee's on the same income?",
    "options": [
      "She pays both employee and employer CPP shares",
      "She pays a special under-25 tax",
      "Her clients pay her CPP automatically"
    ],
    "answerIndex": 0,
    "explanation": "She pays both the employee and employer shares of CPP, since she is her own boss.",
    "teachesLessonId": "lesson-module-7",
    "difficulty": "hard"
  },
  {
    "id": "q-module-8-1",
    "categoryId": "credits-and-benefits",
    "prompt": "True or false: if you earned under the basic personal amount, there is no reason to file.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "Filing can get back withheld tax and unlock benefits like the GST/HST credit.",
    "teachesLessonId": "lesson-module-8",
    "difficulty": "easy"
  },
  {
    "id": "q-module-8-2",
    "categoryId": "credits-and-benefits",
    "prompt": "Your only insurable earnings for the year were $1,800 at a daycare and EI was deducted. What happens when you file?",
    "options": [
      "The EI premiums are never refundable",
      "Only half is refunded",
      "The EI premiums are refunded if total insurable earnings were $2,000 or less"
    ],
    "answerIndex": 2,
    "explanation": "Your EI premiums come back, since your insurable earnings were $2,000 or less.",
    "teachesLessonId": "lesson-module-8",
    "difficulty": "medium"
  },
  {
    "id": "q-module-8-3",
    "categoryId": "credits-and-benefits",
    "prompt": "At what age does CGEB eligibility generally begin for a Canadian resident who has no spouse or common-law partner and is not a parent living with their child?",
    "options": [
      "16",
      "18",
      "19"
    ],
    "answerIndex": 2,
    "explanation": "Generally 19. File the year before you turn 19 so the CRA can assess eligibility. CGEB replaced the GST/HST credit in July 2026; eligibility and income tests still apply.",
    "teachesLessonId": "lesson-module-8",
    "difficulty": "medium"
  },
  {
    "id": "q-module-8-4",
    "categoryId": "credits-and-benefits",
    "prompt": "Is the Canada Groceries and Essentials Benefit (formerly GST/HST credit) taxable income?",
    "options": [
      "No, it is a tax-free benefit",
      "Yes, it is employment income",
      "Only if it is paid quarterly"
    ],
    "answerIndex": 0,
    "explanation": "No. It is a tax-free benefit, not taxable income.",
    "teachesLessonId": "lesson-module-8",
    "difficulty": "medium"
  },
  {
    "id": "q-module-8-5",
    "categoryId": "credits-and-benefits",
    "prompt": "Priya is 17 and CPP was deducted by mistake. If payroll has not reimbursed the overpayment, how can it be reconciled?",
    "options": [
      "Ask her employer for cash",
      "File a tax return",
      "She cannot"
    ],
    "answerIndex": 1,
    "explanation": "File a tax return to reconcile any remaining CPP overpayment. Asking payroll to correct the deduction is also appropriate.",
    "teachesLessonId": "lesson-module-8",
    "difficulty": "hard"
  },
  {
    "id": "q-module-9-1",
    "categoryId": "tfsa-and-rrsp",
    "prompt": "What does FHSA stand for?",
    "options": [
      "Federal Housing Support Allowance",
      "Flexible Home Spending Account",
      "First Home Savings Account"
    ],
    "answerIndex": 2,
    "explanation": "First Home Savings Account.",
    "teachesLessonId": "lesson-module-9",
    "difficulty": "easy"
  },
  {
    "id": "q-module-9-2",
    "categoryId": "tfsa-and-rrsp",
    "prompt": "You earned $10,000 last year. Ignoring pension adjustments and other adjustments, how much new RRSP room does the 18% rule produce?",
    "options": [
      "$1,000",
      "$1,800",
      "$7,000"
    ],
    "answerIndex": 1,
    "explanation": "18% of $10,000 is $1,800. Annual limits and pension adjustments can affect actual room; verify the amount with CRA.",
    "teachesLessonId": "lesson-module-9",
    "difficulty": "medium"
  },
  {
    "id": "q-module-9-3",
    "categoryId": "tfsa-and-rrsp",
    "prompt": "True or false: you build FHSA room every year from age 18, even if you never open one.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "FHSA room starts in the year you open your first FHSA, not automatically at 18. Opening also starts the maximum participation period; check eligibility and timing before opening.",
    "teachesLessonId": "lesson-module-9",
    "difficulty": "medium"
  },
  {
    "id": "q-module-9-4",
    "categoryId": "tfsa-and-rrsp",
    "prompt": "You opened an FHSA last year but put nothing in. What is the most you can contribute this year?",
    "options": [
      "$8,000",
      "$40,000",
      "$16,000, assuming no contributions or transfers and no other adjustments"
    ],
    "answerIndex": 2,
    "explanation": "$16,000. Up to $8,000 of unused room carries forward, on top of this year's $8,000.",
    "teachesLessonId": "lesson-module-9",
    "difficulty": "hard"
  },
  {
    "id": "q-module-9-5",
    "categoryId": "tfsa-and-rrsp",
    "prompt": "You live in BC and just turned 18. Can you open a TFSA?",
    "options": [
      "Not until age 21",
      "Not yet: BC generally requires age 19 to open it",
      "Yes: every province allows opening at 18"
    ],
    "answerIndex": 1,
    "explanation": "In BC, the legal age to open a TFSA is generally 19. Eligible Canadian residents begin accumulating TFSA contribution room at 18.",
    "teachesLessonId": "lesson-module-9",
    "difficulty": "hard"
  },
  {
    "id": "q-module-10-1",
    "categoryId": "slips-and-documents",
    "prompt": "Which slip shows the tuition you paid for the year?",
    "options": [
      "T4",
      "T2202",
      "T5"
    ],
    "answerIndex": 1,
    "explanation": "Your school posts the T2202, usually in your student portal.",
    "teachesLessonId": "lesson-module-10",
    "difficulty": "easy"
  },
  {
    "id": "q-module-10-2",
    "categoryId": "slips-and-documents",
    "prompt": "True or false: unused tuition credits disappear if you do not use them that year.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "They carry forward with no expiry, so you can use them once you are earning more.",
    "teachesLessonId": "lesson-module-10",
    "difficulty": "medium"
  },
  {
    "id": "q-module-10-3",
    "categoryId": "slips-and-documents",
    "prompt": "You received a $3,000 entrance scholarship connected to a qualifying full-time post-secondary program. How should you handle it?",
    "options": [
      "Include the full $3,000 as taxable income automatically",
      "Treat it as employment income",
      "Enter the slip and apply the scholarship exemption; only a taxable portion goes on line 13010"
    ],
    "answerIndex": 2,
    "explanation": "Apply the scholarship exemption correctly. A fully exempt scholarship is not reported as taxable income on line 13010; tax software may ask you to enter the T4A first.",
    "teachesLessonId": "lesson-module-10",
    "difficulty": "medium"
  },
  {
    "id": "q-module-10-4",
    "categoryId": "slips-and-documents",
    "prompt": "You move from Kelowna to Vancouver for full-time university. When could moving expenses be deductible?",
    "options": [
      "Never, because students cannot deduct moving expenses",
      "Only if the qualifying move and eligible-income rules are met",
      "Always, because any university move qualifies"
    ],
    "answerIndex": 1,
    "explanation": "The new home must generally be at least 40 km closer to the qualifying school or new work location. A student move is limited to eligible taxable scholarship or similar income; a qualifying work move has its own rules. Simply taking a nearby job does not automatically qualify the move.",
    "teachesLessonId": "lesson-module-10",
    "difficulty": "hard"
  },
  {
    "id": "q-module-10-5",
    "categoryId": "slips-and-documents",
    "prompt": "Your parents' RESP pays you $6,000, made up of $4,000 they contributed and $2,000 of growth and grants. How much counts as your income?",
    "options": [
      "$2,000 of growth and grants",
      "$6,000",
      "$4,000 of original contributions"
    ],
    "answerIndex": 0,
    "explanation": "$2,000. Your parents' own contributions come back tax-free. Only the growth and grants are taxed in your hands.",
    "teachesLessonId": "lesson-module-10",
    "difficulty": "hard"
  },
  {
    "id": "q-module-11-1",
    "categoryId": "deadlines-and-penalties",
    "prompt": "A caller says you owe the CRA $1,200 and must pay in Apple gift cards today or be arrested. What is this?",
    "options": [
      "A scam: hang up and check through official CRA channels",
      "A valid CRA payment request",
      "A legitimate discount offer"
    ],
    "answerIndex": 0,
    "explanation": "A scam. Hang up and check your balance yourself in CRA My Account.",
    "teachesLessonId": "lesson-module-11",
    "difficulty": "easy"
  },
  {
    "id": "q-module-11-2",
    "categoryId": "deadlines-and-penalties",
    "prompt": "True or false: the standard individual late-filing penalty for a balance owing does not apply when your return instead results in a refund.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 0,
    "explanation": "True for that penalty. File promptly anyway: refunds and benefits can be delayed, and other reporting obligations can carry separate penalties.",
    "teachesLessonId": "lesson-module-11",
    "difficulty": "medium"
  },
  {
    "id": "q-module-11-3",
    "categoryId": "deadlines-and-penalties",
    "prompt": "Under the standard first-time late-filing rule, you owe $500 and file three full months late. What is the penalty before interest?",
    "options": [
      "$25",
      "$40",
      "$65"
    ],
    "answerIndex": 1,
    "explanation": "5% of $500 is $25, plus $15 for three full months: $40. Interest is separate; repeat late-filing rules can be higher.",
    "teachesLessonId": "lesson-module-11",
    "difficulty": "medium"
  },
  {
    "id": "q-module-11-4",
    "categoryId": "deadlines-and-penalties",
    "prompt": "A self-employed creator files on June 10 and pays her $800 balance that day. Did she do anything wrong?",
    "options": [
      "She filed on time but may owe late-payment interest",
      "Both filing and payment were on time",
      "She must file a duplicate return"
    ],
    "answerIndex": 0,
    "explanation": "Partly. Filing by June 15 is on time, but payment was due April 30, so she owes interest on the $800.",
    "teachesLessonId": "lesson-module-11",
    "difficulty": "hard"
  },
  {
    "id": "q-module-11-5",
    "categoryId": "deadlines-and-penalties",
    "prompt": "After receiving your Notice of Assessment, you spot a mistake on your return. What should you do?",
    "options": [
      "File a second return",
      "Request a change in My Account",
      "Wait for the CRA to notice"
    ],
    "answerIndex": 1,
    "explanation": "Request an adjustment using Change my return, eligible ReFILE software, or Form T1-ADJ. Wait for the assessment and do not submit a duplicate return.",
    "teachesLessonId": "lesson-module-11",
    "difficulty": "hard"
  },
  {
    "id": "q-myth-1",
    "categoryId": "tax-basics",
    "prompt": "Lottery winnings are generally taxable income for a casual lottery player in Canada.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "Lottery winnings are generally not taxable. Income later earned by investing the winnings can be taxable.",
    "teachesLessonId": "lesson-module-6",
    "difficulty": "medium"
  },
  {
    "id": "q-myth-2",
    "categoryId": "tax-basics",
    "prompt": "A personal $500 birthday cash gift from your parents counts as taxable income.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "A genuine personal cash gift is generally not taxable to the recipient. Payment for work is different.",
    "teachesLessonId": "lesson-module-6",
    "difficulty": "medium"
  },
  {
    "id": "q-myth-3",
    "categoryId": "credits-and-benefits",
    "prompt": "A large tax refund is automatically a bonus from the government.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "A refund may reflect overpaid tax and/or refundable credits. It is not an automatic bonus; look at the assessment to see why it arose.",
    "teachesLessonId": "lesson-module-8",
    "difficulty": "medium"
  },
  {
    "id": "q-myth-4",
    "categoryId": "first-tax-return",
    "prompt": "You must be 18 to file an income tax return.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "There is no minimum filing age. Reporting earned income can establish future RRSP room.",
    "teachesLessonId": "lesson-module-8",
    "difficulty": "medium"
  },
  {
    "id": "q-myth-5",
    "categoryId": "first-tax-return",
    "prompt": "You must pay a professional to prepare every tax return.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "Free certified software exists, and eligible people with modest income and a simple tax situation can use volunteer clinics.",
    "teachesLessonId": "lesson-module-8",
    "difficulty": "medium"
  },
  {
    "id": "q-myth-6",
    "categoryId": "tfsa-and-rrsp",
    "prompt": "A TFSA withdrawal permanently removes that amount from your contribution room.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "Withdrawals are generally added back on January 1 of the following calendar year. Replacing them earlier without other room can cause an overcontribution.",
    "teachesLessonId": "lesson-module-9",
    "difficulty": "medium"
  },
  {
    "id": "q-myth-7",
    "categoryId": "saving-and-investing",
    "prompt": "Interest from an ordinary non-registered savings account is tax-free.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "Interest is generally taxable even if no T5 is issued. Registered accounts have distinct rules; TFSA and FHSA are not the only tax-advantaged plans.",
    "teachesLessonId": "lesson-module-9",
    "difficulty": "medium"
  },
  {
    "id": "q-myth-8",
    "categoryId": "saving-and-investing",
    "prompt": "Crypto can trigger tax only when it is exchanged for dollars.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "Exchanging one crypto-asset for another is also a disposition that can create a gain or loss. Business-income or capital-gain rules depend on the facts.",
    "teachesLessonId": "lesson-module-7",
    "difficulty": "medium"
  },
  {
    "id": "q-myth-9",
    "categoryId": "employment-and-gig-income",
    "prompt": "A Canadian tax resident can ignore YouTube business revenue paid in US dollars.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "Canadian tax residents generally report worldwide income. Convert foreign-currency amounts into Canadian dollars using an appropriate exchange rate.",
    "teachesLessonId": "lesson-module-7",
    "difficulty": "medium"
  },
  {
    "id": "q-myth-10",
    "categoryId": "slips-and-documents",
    "prompt": "If your employer has not sent a T4, you have no employment income to report.",
    "options": [
      "True",
      "False"
    ],
    "answerIndex": 1,
    "explanation": "Ask for the missing slip and check CRA My Account. If necessary, use records to estimate the income and deductions and correct the return when accurate information arrives.",
    "teachesLessonId": "lesson-module-11",
    "difficulty": "medium"
  }
];
