/* eslint-env node */
// Keep tests deterministic and silent: no real network, no native modules.
process.env.EXPO_PUBLIC_SUPABASE_URL = '';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = '';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
