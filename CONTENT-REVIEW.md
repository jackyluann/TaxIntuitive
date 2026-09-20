# Content review — what Jacky needs to verify or provide

Written for Jacky. Two sections: **tax facts that must be verified before release**, and
**content/assets that don't exist yet**.

Last updated: 20 September 2026

---

## 1. Tax facts to verify against canada.ca ⚠️

Your instruction was: never invent tax rules, and verify anything time-sensitive against current
CRA guidance. I followed that by writing content from your own site's wording and then **flagging**
every lesson that states something time-sensitive, rather than presenting it as settled fact.

Lessons flagged `needsVerification: true` show a **"Verify yearly"** badge and a note telling the
reader to confirm on canada.ca. Clear each one, then set the flag to `false` and update
`lastReviewed`.

| Lesson / guide | Claim to verify |
|---|---|
| `lesson-deadlines` | April 30 filing+payment deadline; June 15 for self-employed (payment still April 30); late-filing penalty of 5% + 1%/month; "refund in about two weeks" |
| `lesson-credits-benefits` | GST/HST credit: the age-19 rule and the exceptions (parent / spouse) |
| `lesson-tfsa-vs-rrsp` | TFSA minimum age 18 vs 19 in some provinces; that withdrawn room returns the *next calendar year* |
| `lesson-gig-income` | Self-employment obligations: instalments, CPP on self-employed income, GST/HST registration threshold |
| `guide-file-first-return` | The filing steps, what CRA My Account auto-fills, what counts as a "simple" return for free clinics |
| `guide-deductions-vs-credits` | Which credits are refundable vs non-refundable |
| `guide-do-i-need-to-file` | Who is *required* to file |
| `guide-tax-brackets` | Deliberately quotes **no** rates or thresholds — keep it that way, or update yearly |

Quiz questions repeat several of these figures (April 30, June 15, 5% + 1%, age 19, age 18,
"about 2 weeks"). If a rule changes, update **both** the lesson and the matching question in
`mobile/src/content/quizzes.ts`.

**Deliberately avoided:** no specific dollar amounts, contribution limits, tax rates or bracket
thresholds appear anywhere. That was intentional — they change annually and are the easiest thing
to get wrong.

---

## 2. Things I corrected from the live site

| Issue | What I did |
|---|---|
| Homepage guide titled **"What is a W-2? Explained Simply"** — a US form | Migrated as **"What is a T4? Explained Simply"**, with a note that the T4 is the Canadian equivalent. A test (`content-integrity.test.ts`) now fails the build if American tax terms reappear. |
| Homepage statistics: **"100% Confident Tax Filers"**, **"500k+ Young Adults Empowered"**, **"90% Knowledge Gained"** | **Left out entirely** — not verifiable for a new project. A test asserts they never come back. If you can substantiate real numbers, add them. |
| Workshops page has a "Book Now" button but no sessions | App shows a proper "No workshops scheduled yet" state plus a working request form, rather than inventing events. |
| Wix site regional settings are **US / USD / America-Los_Angeles** | Nothing to change in the app (it formats as `en-CA`), but **fix this on the Wix site** — it's wrong for a Canadian audience. |
| Site page slugs don't match their titles (`/blank` = XP Tracker, `/tax-glossary` = Tax Simulator) | Only affects the website. Worth renaming for SEO, since `/blank-1` won't rank for "FAQ". |

---

## 3. Assets and content you need to provide

### Videos — 15 episodes, 0 filmed 🎥
Every episode from your video series is in the app with its title, question, description, category
and cross-links — but **no YouTube IDs**, so all 15 show a "coming soon" state.

To publish one: set `youtubeId` in `mobile/src/content/videos.ts` (or the `content_videos` table)
to the part after `v=` in the YouTube URL. No code change needed.

Also missing per video: `durationSeconds`, `transcript`, and `captionsAvailable`. The spec asked for
captions and transcripts — the screens support both, but the text has to come from you.

### App icon and splash screen 🎨
Still the default Expo artwork:
- `mobile/assets/images/icon.png` — needs the TaxIntuitive mark (1024×1024, no transparency for iOS)
- `mobile/assets/images/splash-icon.png`
- `mobile/assets/images/android-icon-foreground.png` / `-monochrome.png`
- `mobile/assets/images/favicon.png`

Brand colours are already wired in (`#12B886` splash/adaptive-icon background).

### Founder photo 📷
Your prototype had a photo embedded as a base64 JPEG. I used initials ("JL") in a branded tile
instead, because I didn't want to re-encode a photo of a real person into the repo without asking.
Drop a JPG/PNG into `mobile/assets/images/` and swap the tile in `src/app/about.tsx` if you'd like
the real photo.

### Workshops 🎓
No sessions exist. Add them to `content_workshops` in Supabase (or `src/content/workshops.ts`) with
title, description, `startsAt`, location, and a registration URL.

### Social links 🔗
The About screen has email and the website. If TaxIntuitive has Instagram/TikTok/YouTube accounts,
send the handles and I'll add them.

### Privacy policy review 🔒
`src/app/privacy.tsx` is a **draft I wrote to match what the app actually does**. It is accurate to
the code, but have an adult/legal reviewer check it before you submit to the App Store, and set the
real "last updated" date on publish.

---

## 4. Content decisions worth a second opinion

1. **A quiz "passes" at 60%.** Matches your website's verdict thresholds. Easy to change:
   `PASS_RATIO` in `src/lib/xp/engine.ts`.
2. **The Financial Literacy Score is `earned XP ÷ all available XP`.** Honest and derived from real
   activity, but it means adding new content *lowers* everyone's score slightly. An alternative is
   scoring against a fixed "core curriculum" subset — say the word and I'll switch it.
3. **XP values** (2 for opening a lesson, the lesson's own value for completing, 4/correct answer,
   50 for the simulator, 25 for a Duo win) are my invention — your site didn't specify. Tune freely
   in `src/content/*` and `XP_RULES` in `src/providers/progress.tsx`.
4. **I added 11 questions** beyond your original 26, to cover Your Paycheque and Banking & Credit,
   which had lessons but no quiz. Please fact-check the new ones — they're the `q-pay-*` and
   `q-credit-*` ids in `quizzes.ts`.
5. **I added 2 simulator scenarios** (Month 3 banking setup, Month 10 tuition/T2202) to cover the
   budgeting/banking/education decisions the spec listed. Original 9 are unchanged in substance.
6. **Two FAQs added** — "Do I need an account?" and "Does the app work offline?" — because those
   are the first things app users ask and your site's FAQ predates the app.
