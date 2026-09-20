import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { bundledContent } from '@/content';
import type { ContentBundle } from '@/content/types';
import { fetchRemoteContent, loadCachedContent } from '@/lib/content/repository';

export interface ContentApi {
  content: ContentBundle;
  /** True while the first (cached) load is in flight. Screens can render bundled content meanwhile. */
  loading: boolean;
  /** True while a background refresh from Supabase is running. */
  refreshing: boolean;
  refresh(): Promise<void>;
  /** 'bundled' | 'cache' | 'remote' — shown in Settings so content state is never a mystery. */
  source: 'bundled' | 'cache' | 'remote';
}

const ContentContext = createContext<ContentApi | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  // Start from the bundled seed so the very first frame has real content, never a spinner.
  const [content, setContent] = useState<ContentBundle>(bundledContent);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<ContentApi['source']>('bundled');

  useEffect(() => {
    let active = true;

    (async () => {
      const cached = await loadCachedContent();
      if (!active) return;
      if (cached !== bundledContent) {
        setContent(cached);
        setSource('cache');
      }
      setLoading(false);

      // Background refresh; failure is silent because we always have usable content.
      setRefreshing(true);
      const remote = await fetchRemoteContent();
      if (!active) return;
      if (remote) {
        setContent(remote);
        setSource('remote');
      }
      setRefreshing(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    const remote = await fetchRemoteContent();
    if (remote) {
      setContent(remote);
      setSource('remote');
    }
    setRefreshing(false);
  };

  const value = useMemo<ContentApi>(
    () => ({ content, loading, refreshing, refresh, source }),
    [content, loading, refreshing, source],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentApi {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>');
  return ctx;
}
