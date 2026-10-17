# TaxIntuitive

A React Native / Expo mobile app that teaches young Canadians how taxes and personal finance
actually work — lessons, quizzes, expert videos, a money simulator, XP tracking, and a two-player
Quiz Duo mode.

Built from the content of [taxintuitive.com](https://www.taxintuitive.com). It is a **native app,
not a WebView wrapper**: every website section was reorganised into mobile screens.

---

## Backend deployment — 17 October 2026

The Free-plan Supabase project `friqxppxnchvytmqkfqb` is deployed in Canada (Central).
Its API is `https://friqxppxnchvytmqkfqb.supabase.co`.
All four migrations, bundled content, six Quiz Duo functions and `delete-account` are deployed.

Quiz Duo writes are transactional: `duo_command` locks the match while joining, scoring,
advancing or forfeiting. Only the service role may execute it, and Edge Functions derive the
user ID from a verified session. Clients cannot insert participants, change scores, or set a
winner; their only direct write is their own presence timestamp. Answer retries return the
stored result. The server records missing timeout answers, and the app polls to recover from
missed Realtime events and retries failed submissions.

Validated against both local and hosted Supabase with disposable accounts: unauthorized writes,
simultaneous guest joins, complete matches, duplicate answers, score totals and winners,
two authenticated Realtime subscriptions, disconnected-player timeouts, stale advance requests,
and repeated forfeits. This is API/Realtime validation, not a two-phone device certification.

From `mobile/`:

```bash
npm run backend:start                 # Docker Desktop must be running
npm run backend:serve                 # keep running for local Edge Functions
npm run backend:configure -- --local  # writes ignored .env, public client keys only
npm run test:duo                      # local integration tests, disposable accounts

# Connect the app to the hosted project (requires Supabase CLI login):
npm run backend:configure -- friqxppxnchvytmqkfqb
# Explicit opt-in to hosted integration tests; creates and deletes its own test accounts:
npm run test:duo -- friqxppxnchvytmqkfqb
```

Restart Expo after changing `.env`. A physical phone cannot reach the computer through
`127.0.0.1`; use the hosted project for device testing. Never place a service-role key in an
`EXPO_PUBLIC_` variable. Local configuration and CLI login tokens are not committed.

For future backend releases, run from the repository root:

```bash
npx supabase@2.121.0 link --project-ref friqxppxnchvytmqkfqb
npx supabase@2.121.0 db push --dry-run
npx supabase@2.121.0 db push
npx supabase@2.121.0 functions deploy --project-ref friqxppxnchvytmqkfqb
```

Do not reseed a live project casually: the seed can overwrite edited content. Public email
onboarding/delivery and password recovery still need production configuration and device testing;
Apple and Google sign-in need their provider credentials. The Duo question bank is still shared
with offline lessons/quizzes, so this mode is intended for casual learning, not ranked competition.

---

## What works today

| Area | State |
|---|---|
| Guest mode (no account) | ✅ Everything below except Quiz Duo and cloud sync |
| Learning Hub — 16 lessons/guides in 11 categories | ✅ Offline, bookmarks, resume, completion, sources |
| Quizzes — 37 questions, 9 quizzes, Quiz of the Week | ✅ Offline, per-answer explanations, lesson recommendations |
| Tax Simulator — 11 scenarios | ✅ Offline, Bronze/Silver/Gold result, lessons learned |
| XP Tracker + Achievements — 15 badges | ✅ All derived from real activity, never hard-coded |
| Videos — 15 episodes | ⚠️ Screens work; **no episodes filmed yet** (see CONTENT-REVIEW.md) |
| Workshops | ⚠️ Screen + request form work; **no sessions published yet** |
| Accounts (email/password) | ✅ Verified against local Supabase (signup, profile trigger, deletion) |
| Accounts (Apple, Google) | 🔧 Code complete, never exercised against real provider credentials |
| Quiz Duo (realtime 2-player) | ✅ Full match played end-to-end against local Supabase |
| Cloud sync + guest→account merge | 🔧 Code complete, unit-tested, not yet exercised on a device |

**Verified locally:** 75 tests pass, TypeScript and ESLint are clean, the app bundles for iOS
(`expo export` produces a 4 MB Hermes bundle), and the whole Supabase stack was applied and
exercised against a real Postgres — migrations, RLS policies, all 7 Edge Functions, and a complete
Quiz Duo match. It has **not** yet been run on a device or simulator — see *Not yet verified*.

---

## Quick start

```bash
cd mobile
npm install
npx expo start          # press i for iOS, a for Android, or scan the QR code with Expo Go
```

The app runs immediately with **no configuration**: content is bundled and guest progress is stored
on-device. Supabase is only needed for accounts, sync, and Quiz Duo.

### Useful commands

```bash
npm test                # 75 unit + integration tests
npm run typecheck       # tsc --noEmit
npm run lint            # expo lint
npm run seed:generate   # regenerate ../supabase/seed.sql from src/content
```

---

## Connecting Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the config:
   ```bash
   cd mobile
   cp .env.example .env
   # fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
   ```
3. Apply the schema and seed the content:
   ```bash
   npm install -g supabase       # or: brew install supabase/tap/supabase
   supabase link --project-ref <your-project-ref>
   supabase db push              # runs supabase/migrations/*
   psql "$DATABASE_URL" -f supabase/seed.sql   # or paste into the SQL editor
   ```
4. Deploy the Edge Functions (Quiz Duo scoring + account deletion):
   ```bash
   supabase functions deploy duo-create-match duo-join-match duo-ready \
     duo-submit-answer duo-advance duo-abandon delete-account
   ```
5. Enable the sign-in methods you want under **Authentication → Providers**
   (Email, Apple, Google). For Apple you also need an Apple Developer account and a
   Services ID; for Google, an OAuth client.

### Running Supabase locally

Use Docker Desktop and the pinned CLI commands in the backend deployment section above.
Studio is available at http://127.0.0.1:54323 and the API at http://127.0.0.1:54321.
Use `npx supabase@2.121.0 stop` from the repository root to stop services without deleting data.

**What was verified against the local stack:**

| Check | Result |
|---|---|
| All 3 migrations apply from scratch | ✅ |
| seed.sql loads all content | ✅ 11 categories, 16 lessons, 37 questions, 15 videos, 20 glossary terms, 10 FAQs, 11 scenarios, 15 achievements |
| JSONB lesson bodies / quiz options round-trip | ✅ |
| anon can read content, cannot read anyone's progress | ✅ |
| a signed-in user sees only their own rows | ✅ |
| a user cannot forge an xp_event for someone else | ✅ blocked by RLS |
| a user cannot insert their own duo_answers | ✅ blocked by RLS |
| **a user cannot raise their own Duo score** | ✅ blocked by trigger (see note below) |
| a user can still mark themselves ready | ✅ |
| non-editors cannot edit content | ✅ blocked by RLS |
| service role (Edge Functions) can still write scores | ✅ |
| duplicate answers / duplicate XP awards | ✅ blocked by unique constraints |
| full Quiz Duo match: create → join → ready → 8 questions → winner | ✅ |
| speed and streak bonuses | ✅ 149 pts for a 269 ms answer, rising with streak |
| malformed answer payloads | ✅ rejected, no database write |
| delete-account cascades user, profile and Duo rows | ✅ all zeroed |

> **A real bug this caught.** The trigger that stops a client raising its own Quiz Duo score was
> declared `SECURITY DEFINER`. Inside such a function `current_user` is the function *owner*
> (`postgres`), so the guard matched its own trusted-role check and silently disabled itself — a
> client could set its score to 9999. It is now `SECURITY INVOKER` and also checks the JWT role
> claim. Verified by re-running the exploit before and after.

---

## Project layout

```
TaxIntuitive/
├── mobile/                      Expo app (SDK 57, RN 0.86, React 19, TypeScript)
│   ├── src/app/                 Expo Router routes — 24 screens
│   │   ├── (tabs)/              Home · Learn · Quizzes · Videos · More
│   │   ├── lesson/[id]          lesson & guide reader
│   │   ├── quiz/[id]            solo quiz player
│   │   ├── video/[id]           video detail
│   │   ├── duo/                 Quiz Duo lobby + live match
│   │   └── auth/                sign-in · sign-up
│   ├── src/content/             ⭐ ALL COPY LIVES HERE (see "Editing content")
│   ├── src/lib/
│   │   ├── xp/                  XP engine + achievement rules (pure, fully tested)
│   │   ├── content/             offline-first content repository
│   │   ├── duo/                 Quiz Duo client
│   │   ├── sync/                cloud progress sync
│   │   ├── storage/             AsyncStorage wrapper
│   │   └── supabase/            client + row types
│   ├── src/providers/           auth · content · progress (React context)
│   ├── src/components/          design system (ui.tsx, BlockRenderer, Field)
│   ├── src/theme/               brand tokens, light + dark
│   └── __tests__/               9 suites, 75 tests
├── supabase/
│   ├── migrations/              schema + row-level security
│   ├── functions/               7 TypeScript Edge Functions (Deno)
│   └── seed.sql                 GENERATED — content rows
├── CONTENT-REVIEW.md            ⚠️ what Jacky must verify or provide
└── _archive/                    superseded Java backend (safe to delete)
```

---

## Editing content

Content is **data, not code**. Screens render whatever conforms to the types in
`mobile/src/content/types.ts`, so you can change copy without touching a screen.

- **Before launch:** edit the files in `mobile/src/content/` and run `npm run seed:generate`.
- **After launch:** edit the `content_*` tables in Supabase. The app fetches them on launch,
  caches the result, and falls back to the bundled copy when offline. Bump `CONTENT_VERSION`
  in `src/content/index.ts` when you change the bundled seed.

To publish a video episode, set its `youtubeId` (the part after `v=` in a YouTube URL). Until then
the app shows a "coming soon" state instead of a broken player.

---

## Architecture notes

**Offline-first.** Content ships inside the app, so a cold first launch with no network shows real
lessons. Supabase content is layered on top when reachable; a failed fetch never degrades the app.

**Guest-first.** No sign-in wall. Progress lives in AsyncStorage and is offered for merge when an
account is later created (`mergeProgress` dedupes XP on `(reason, refId)` so nothing double-counts).

**Progress is always derived.** The Financial Literacy Score, levels, track percentages and badges
are computed from XP events and activity in `src/lib/xp/engine.ts` — there are no hard-coded
percentages anywhere.

**Quiz Duo is server-authoritative.** Correctness, elapsed time and points are computed in the
`duo-submit-answer` Edge Function using the server clock. Clients have no insert policy on
`duo_answers`, and a database trigger rejects any client attempt to modify its own score.

**Row-level security everywhere.** Progress tables are owner-only. Duo rows are readable only by
the two participants. Content is world-readable but writable only by rows in `content_editors`.

> **Known limitation:** because solo quizzes must work offline, the question bank (including answer
> keys) ships inside the app. A determined user could therefore read answers before a Duo match.
> Server-side scoring still prevents score tampering. If Duo ever becomes competitive/ranked, move
> its questions to a server-only pool.

---

## Building for devices

Both builds use [EAS Build](https://docs.expo.dev/build/introduction/), so no local Xcode or
Android Studio toolchain is required.

```bash
npm install -g eas-cli
eas login
cd mobile
eas build:configure
```

### iOS

```bash
eas build --platform ios --profile development   # simulator/device dev build
eas build --platform ios --profile production    # App Store build
eas submit --platform ios
```

- Requires an Apple Developer Program membership ($99/yr).
- Bundle identifier is `com.taxintuitive.app` (`app.json`).
- **Sign in with Apple is mandatory** if you ship Google sign-in on iOS — already implemented
  (`usesAppleSignIn: true`).
- The app declares calendar access only, used when someone adds a workshop to their calendar.

### Android

```bash
eas build --platform android --profile development   # APK for testing
eas build --platform android --profile production    # AAB for Play Store
eas submit --platform android
```

- Requires a Google Play Developer account (one-time $25).
- Package name is `com.taxintuitive.app`.
- Edge-to-edge is enabled, as Play now requires.

### Local run without EAS

```bash
npx expo run:ios       # needs Xcode
npx expo run:android   # needs Android Studio + SDK
```

---

## Testing

```bash
cd mobile && npm test
```

| Suite | Covers |
|---|---|
| `xp-engine.test.ts` | levels, streaks, derived stats, idempotent awards |
| `achievements.test.ts` | every badge rule, including partial progress |
| `merge-progress.test.ts` | guest→account merge, dedupe, no lost history |
| `quiz-selection.test.ts` | quiz resolution, weekly rotation, timezone stability |
| `simulator.test.ts` | tier thresholds; gold is reachable and losable |
| `content-integrity.test.ts` | ids unique, cross-references resolve, answers in range, **Canadian-only copy**, no unverified stats |
| `progress-integration.test.tsx` | providers + engine + persistence, as a guest experiences it |

---

## Not yet verified

Being straight about what has and hasn't been checked:

- ✅ TypeScript clean, ESLint clean, 75 tests pass, iOS bundle builds.
- ✅ Supabase migrations, RLS policies, seed and all 7 Edge Functions applied and exercised
  against a real local Postgres. A full Quiz Duo match was played end-to-end.
- ❌ **Never launched on a simulator or device.** Native-device interaction testing remains outstanding; web preview checks do not replace it.
- ✅ Hosted schema, content and all seven Edge Functions deployed; Duo integration suite passed.
- ❌ Apple/Google sign-in never exercised against real provider credentials.
- ✅ Two authenticated Realtime clients observed match start and completion in integration tests.
- ❌ Two physical phones have not yet been used for a complete match.
- ❌ Accessibility: roles/labels/hit targets are set throughout, but no screen-reader pass was run.

See `CONTENT-REVIEW.md` for the content and asset gaps.
