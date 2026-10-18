# Web beta

Production origin: https://taxintuitive-web.spicyangel9.chatgpt.site

The Expo app is shared by Web and native. Build from `mobile` with `npm ci` and `npm run build:web`. Supply only EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in the ignored .env. Never include a service-role key.

Serve `mobile/dist` over HTTPS with SPA fallback: all non-asset routes must resolve to index.html. `_redirects` is included for compatible hosts. Verify a direct lesson URL and a browser reload after each deployment.

The beta supports guest lessons, practice, XP, and the simulator. Quiz Duo and cloud sync require an account. Public beta email/password signup is enabled. The owner approved disabling email confirmation on 2026-10-18 because custom SMTP is unavailable. Email ownership is not verified. Password recovery is unavailable and its UI entry is removed until SMTP is configured.

Before opening registration:
- Configure custom SMTP in Supabase, verify the sender domain, and test delivery to an external address.
- Set Auth Site URL to the production origin and allow exact redirect URLs `/auth/sign-in` and `/reset-password` on that origin.
- Exercise confirmation, sign-in, reset, and account deletion with disposable accounts.
- Re-enable Supabase email confirmation, restore the password recovery UI, and update beta messaging when SMTP delivery is verified.
- Enable EXPO_PUBLIC_GOOGLE_AUTH_ENABLED only after Google OAuth credentials and allowed redirect origins are configured.

Sites deployment source lives at `sites/taxintuitive-web` in the Codex workspace. It contains this sanitized source and the static release. Its .openai/hosting.json holds the persistent Site ID; reuse it for updates. No credentials are stored in the Site source.

Native App Store submission remains a separate step after Web beta feedback; this release does not submit an iOS build.
