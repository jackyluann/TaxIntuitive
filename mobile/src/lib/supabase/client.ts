import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * Supabase is OPTIONAL at runtime.
 *
 * The app is guest-first and fully usable offline, so a missing/blank config must never crash it.
 * `supabase` is null when no URL/key is configured; callers check `isSupabaseConfigured` and fall
 * back to local-only behaviour. Only Quiz Duo and cloud sync hard-require it.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? '';

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Deliberately untyped (`SupabaseClient` without a Database generic).
 * Row shapes are applied explicitly at each call site from `./database.types`, which keeps this
 * repo typechecking without a live database. Swap in the generic once you run
 * `supabase gen types typescript` against your real project.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // RN has no URL bar to parse a session out of.
        detectSessionInUrl: false,
      },
    })
  : null;

/** Throws a clear error instead of a null-deref when a cloud-only feature is used unconfigured. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  return supabase;
}
