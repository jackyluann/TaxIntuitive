# TaxIntuitive

A React Native / Expo mobile app that teaches young Canadians how taxes and personal finance
actually work — lessons, quizzes, expert videos, a money simulator, XP tracking, and a two-player
Quiz Duo mode.

Built from the content of [taxintuitive.com](https://www.taxintuitive.com). It is a **native app,
not a WebView wrapper**: every website section was reorganised into mobile screens.

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
| Accounts (email, Apple, Google) | 🔧 Code complete, needs a Supabase project |
| Quiz Duo (realtime 2-player) | 🔧 Code complete, needs Supabase + Edge Functions deployed |
| Cloud sync + guest→account merge | 🔧 Code complete, needs Supabase |

**Verified locally:** 66 tests pass, TypeScript is clean, and the app bundles for iOS
(`expo export` produces a 4 MB Hermes bundle). It has **not** yet been run on a device or
simulator — see *Not yet verified* at the bottom.

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
npm test                # 66 unit + integration tests
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

### Running Supabase locally instead

Local Supabase needs Docker Desktop, which is **not installed on this machine**. Once you have it:

```bash
supabase start
supabase db reset     # applies migrations + seed.sql automatically
```

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
│   └── __tests__/               7 suites, 66 tests
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

- ✅ TypeScript clean, 66 tests pass, iOS bundle builds.
- ❌ **Never launched on a simulator or device.** No screenshots, no interaction testing.
- ❌ **Supabase never applied.** Migrations, RLS policies, Edge Functions and the seed are
  written but unexecuted — no Docker/Postgres was available here. Expect small fixes on first
  `db push`.
- ❌ **Quiz Duo never played end-to-end** (needs two signed-in devices and deployed functions).
- ❌ Apple/Google sign-in never exercised against real provider credentials.
- ❌ Accessibility: roles/labels/hit targets are set throughout, but no screen-reader pass was run.

See `CONTENT-REVIEW.md` for the content and asset gaps.
