import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';
import { Card, EmptyState, Pill, Screen, SectionTitle, TIText } from '@/components/ui';

export default function VideosScreen() {
  const t = useTheme();
  const router = useRouter();
  const { content } = useContent();
  const { progress } = useProgress();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(content.videos.map((v) => v.category))),
    [content.videos],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.videos
      .filter((v) => (category ? v.category === category : true))
      .filter((v) =>
        q.length === 0
          ? true
          : `${v.title} ${v.question} ${v.description} ${v.category}`.toLowerCase().includes(q),
      )
      .sort((a, b) => a.order - b.order);
  }, [content.videos, query, category]);

  const featured = content.videos.find((v) => v.featured);
  const publishedCount = content.videos.filter((v) => v.youtubeId.trim()).length;

  return (
    <Screen>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="h2">Ask a Tax Expert</TIText>
        <TIText variant="small" tone="muted">
          Real questions from young Canadians, answered in plain language by a tax expert — no boring
          textbook.
        </TIText>
        {publishedCount === 0 ? (
          <Pill label="Episodes coming soon" tone="muted" />
        ) : (
          <Pill label={`${publishedCount} of ${content.videos.length} published`} />
        )}
      </Card>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search videos"
        placeholderTextColor={t.colors.muted}
        accessibilityLabel="Search videos"
        style={{
          backgroundColor: t.colors.card,
          borderRadius: t.radius.lg,
          borderWidth: 1,
          borderColor: t.colors.line,
          paddingHorizontal: t.space.lg,
          paddingVertical: 14,
          fontSize: 15,
          color: t.colors.ink,
        }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm }}>
        <FilterChip label="All" active={category === null} onPress={() => setCategory(null)} />
        {categories.map((c) => (
          <FilterChip
            key={c}
            label={c}
            active={category === c}
            onPress={() => setCategory(category === c ? null : c)}
          />
        ))}
      </View>

      {featured && !query && !category ? (
        <>
          <SectionTitle>Featured</SectionTitle>
          <Card onPress={() => router.push(`/video/${featured.id}`)}>
            <View
              style={{
                aspectRatio: 16 / 9,
                borderRadius: t.radius.lg,
                backgroundColor: t.colors.brandDark,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: t.space.md,
              }}
            >
              <Text style={{ fontSize: 34, color: t.colors.onBrand }}>▶</Text>
              {!featured.youtubeId ? (
                <Text style={{ color: t.colors.onBrand, fontSize: 12.5, marginTop: 6, opacity: 0.9 }}>
                  Coming soon
                </Text>
              ) : null}
            </View>
            <TIText variant="h3">{featured.title}</TIText>
            <TIText variant="small" tone="muted">
              {featured.question}
            </TIText>
          </Card>
        </>
      ) : null}

      <SectionTitle>{query || category ? 'Results' : 'All episodes'}</SectionTitle>
      {results.length === 0 ? (
        <EmptyState
          emoji="🎥"
          title="No videos match"
          body="Try a different search or category."
        />
      ) : (
        results.map((video) => {
          const watched = progress.videos[video.id]?.completed;
          return (
            <Card key={video.id} onPress={() => router.push(`/video/${video.id}`)}>
              <View style={{ flexDirection: 'row', gap: t.space.md }}>
                <View
                  style={{
                    width: 74,
                    height: 54,
                    borderRadius: t.radius.md,
                    backgroundColor: video.youtubeId ? t.colors.brandDark : t.colors.subtle,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: video.youtubeId ? t.colors.onBrand : t.colors.muted,
                    }}
                  >
                    ▶
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', gap: t.space.sm, alignItems: 'center' }}>
                    <TIText variant="caption" tone="brand">
                      {video.category}
                    </TIText>
                    {watched ? <Pill label="Watched" tone="success" /> : null}
                    {!video.youtubeId ? <Pill label="Soon" tone="muted" /> : null}
                  </View>
                  <TIText variant="bodyStrong">{video.title}</TIText>
                  <TIText variant="caption" tone="muted" numberOfLines={2}>
                    {video.description}
                  </TIText>
                </View>
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: t.space.lg,
        borderRadius: t.radius.pill,
        backgroundColor: active ? t.colors.brand : t.colors.card,
        borderWidth: 1.5,
        borderColor: active ? t.colors.brand : t.colors.line,
      }}
    >
      <Text
        style={{
          fontWeight: '700',
          fontSize: 13,
          color: active ? t.colors.onBrand : t.colors.brandDark,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
