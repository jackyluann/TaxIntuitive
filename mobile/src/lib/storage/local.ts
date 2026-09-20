import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local persistence for guest data. Everything a signed-out learner does lives here, and is
 * offered up for merging when they later create an account.
 */
export const StorageKeys = {
  progress: 'ti.progress.v1',
  contentCache: 'ti.content.v1',
  onboardingSeen: 'ti.onboarding.v1',
  guestId: 'ti.guestId.v1',
  /** Set once the learner has merged (or declined to merge) guest data into an account. */
  mergeOffered: 'ti.mergeOffered.v1',
} as const;

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // Corrupt or unavailable storage must never crash the app.
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Best effort: a failed write should not interrupt learning.
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
