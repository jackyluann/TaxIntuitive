import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Lesson } from '@/content/types';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';
import { Card, EmptyState, Pill, ProgressBar, Screen, SectionTitle, TIText } from '@/components/ui';

type Filter = 'all' | 'lessons' | 'guides' | 'bookmarked' | 'in-progress';

export default function LearnScreen() {
  const t = useTheme();
  const router = useRouter();
  const { content } = useContent();
  const { progress, stats } = useProgress();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const all = content.lessons;
    switch (filter) {
      case 'lessons':
        return all.filter((l) => l.kind === 'lesson');
      case 'guides':
        return all.filter((l) => l.kind === 'guide');
      case 'bookmarked':
        return all.filter((l) => progress.lessons[l.id]?.bookmarked);
      case 'in-progress':
        return all.filter((l) => progress.lessons[l.id]?.opened && !progress.lessons[l.id]?.completed);
      default:
        return all;
    }
  }, [content.lessons, filter, progress.lessons]);

  const byCategory = useMemo(() => {
    return content.categories
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((cat) => ({
        category: cat,
        items: filtered
          .filter((l) => l.categoryId === cat.id)
          .sort((a, b) => a.order - b.order),
      }))
      .filter((group) => group.items.length > 0);
  }, [content.categories, filtered]);

  return (
    <Screen>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="h2">Learning Hub</TIText>
        <TIText variant="small" tone="muted">
          Plain-language lessons and how-to guides for young Canadians. Read at your own pace — your
          progress saves automatically.
        </TIText>
        <View style={{ gap: 6, marginTop: t.space.xs }}>
          <ProgressBar value={stats.lessonsCompleted / Math.max(1, stats.lessonsAvailable)} />
          <TIText variant="caption" tone="muted">
            {stats.lessonsCompleted} of {stats.lessonsAvailable} finished
          </TIText>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm }}>
        {(
          [
            ['all', 'All'],
            ['lessons', 'Lessons'],
            ['guides', 'Guides'],
            ['in-progress', 'In progress'],
            ['bookmarked', 'Saved'],
          ] as [Filter, string][]
        ).map(([key, label]) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(key)}
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
                  fontSize: 13.5,
                  color: active ? t.colors.onBrand : t.colors.brandDark,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/glossary')}
        style={{ marginTop: -t.space.sm }}
      >
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
            <Text style={{ fontSize: 24 }}>📖</Text>
            <View style={{ flex: 1 }}>
              <TIText variant="bodyStrong">Tax Glossary</TIText>
              <TIText variant="caption" tone="muted">
                {content.glossary.length} terms, defined simply
              </TIText>
            </View>
            <Text style={{ color: t.colors.muted, fontSize: 20 }}>›</Text>
          </View>
        </Card>
      </Pressable>

      {byCategory.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="Nothing here yet"
          body={
            filter === 'bookmarked'
              ? 'Bookmark a lesson to find it again quickly.'
              : 'Try a different filter to see more lessons.'
          }
        />
      ) : (
        byCategory.map(({ category, items }) => (
          <View key={category.id} style={{ gap: t.space.md }}>
            <SectionTitle>{`${category.emoji}  ${category.title}`}</SectionTitle>
            {items.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                completed={Boolean(progress.lessons[lesson.id]?.completed)}
                bookmarked={Boolean(progress.lessons[lesson.id]?.bookmarked)}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
              />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

function LessonRow({
  lesson,
  completed,
  bookmarked,
  onPress,
}: {
  lesson: Lesson;
  completed: boolean;
  bookmarked: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Card onPress={onPress} accessibilityLabel={lesson.title}>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.sm }}>
          {lesson.kind === 'guide' ? <Pill label="Guide" tone="accent" /> : null}
          {completed ? <Pill label="✓ Done" tone="success" /> : null}
          {bookmarked ? <Text style={{ fontSize: 14 }}>🔖</Text> : null}
        </View>
        <TIText variant="h3">{lesson.title}</TIText>
        <TIText variant="small" tone="muted">
          {lesson.summary}
        </TIText>
        <TIText variant="caption" tone="muted">
          {lesson.readingMinutes} min · {lesson.xp} XP
          {lesson.needsVerification ? ' · needs annual review' : ''}
        </TIText>
      </View>
    </Card>
  );
}
