import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { isSupabaseConfigured, requireSupabase, supabase } from '@/lib/supabase/client';

export interface AuthState {
  session: Session | null;
  user: User | null;
  /** True until the stored session has been restored — screens show a spinner meanwhile. */
  loading: boolean;
  /** Guest = no account. The whole app except Quiz Duo and sync works in this state. */
  isGuest: boolean;
  displayName: string | null;
  /** False when no Supabase config exists; auth UI explains instead of failing silently. */
  authAvailable: boolean;
  appleAvailable: boolean;

  signUpWithEmail(email: string, password: string, displayName: string): Promise<{ signedIn: boolean }>;
  signInWithEmail(email: string, password: string): Promise<void>;
  signInWithApple(): Promise<void>;
  signInWithGoogle(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  /** Permanently deletes the account and all its rows via the delete-account Edge Function. */
  deleteAccount(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Nothing to restore when Supabase isn't configured, so we're not loading in that case.
  const [loading, setLoading] = useState(() => Boolean(supabase));
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session ?? null);
        setLoading(false);
      }
    }).catch(() => { if (active) setLoading(false); });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      const client = requireSupabase();
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: displayName.trim() },
          emailRedirectTo: AuthSession.makeRedirectUri({ scheme: 'taxintuitive', path: 'auth/sign-in' }),
        },
      });
      if (error) throw new Error(error.message);
      return { signedIn: Boolean(data.session) };
    },
    [],
  );

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.message);
  }, []);

  const signInWithApple = useCallback(async () => {
    const client = requireSupabase();
    // A nonce ties Apple's token to this request. Apple hashes it with SHA-256.
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (!credential.identityToken) throw new Error('Apple did not return an identity token.');

    const { error } = await client.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });
    if (error) throw new Error(error.message);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const client = requireSupabase();
    const redirectTo = AuthSession.makeRedirectUri({ scheme: 'taxintuitive' });
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      // We open the browser ourselves so the redirect comes back into the app.
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw new Error(error.message);
    if (!data.url) throw new Error('Could not start Google sign-in.');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success' || !result.url) {
      throw new Error('Google sign-in was cancelled.');
    }
    await completeOAuthFromUrl(result.url);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: AuthSession.makeRedirectUri({ scheme: 'taxintuitive', path: 'reset-password' }),
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const deleteAccount = useCallback(async () => {
    const client = requireSupabase();
    const { error } = await client.functions.invoke('delete-account');
    if (error) throw new Error(error.message);
    await client.auth.signOut();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isGuest: !session,
      displayName:
        (session?.user.user_metadata?.display_name as string | undefined) ??
        session?.user.email?.split('@')[0] ??
        null,
      authAvailable: isSupabaseConfigured,
      appleAvailable,
      signUpWithEmail,
      signInWithEmail,
      signInWithApple,
      signInWithGoogle,
      sendPasswordReset,
      signOut,
      deleteAccount,
    }),
    [
      session,
      loading,
      appleAvailable,
      signUpWithEmail,
      signInWithEmail,
      signInWithApple,
      signInWithGoogle,
      sendPasswordReset,
      signOut,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Exchanges the tokens in an OAuth redirect URL for a Supabase session. */
async function completeOAuthFromUrl(url: string) {
  const client = requireSupabase();
  const parsed = new URL(url);
  const params = new URLSearchParams(
    parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.search,
  );
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  const code = params.get('code');

  if (access_token && refresh_token) {
    const { error } = await client.auth.setSession({ access_token, refresh_token });
    if (error) throw new Error(error.message);
    return;
  }
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
    return;
  }
  throw new Error('Sign-in did not return a session.');
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
