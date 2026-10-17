import { AppIcon } from '@/components/AppIcon';
import React, { useEffect, useMemo, useRef } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DISCLAIMER } from '@/content';
import { BlockRenderer } from '@/components/BlockRenderer';
import { Button, Card, DisclaimerNote, Pill, TIText } from '@/components/ui';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';

export default function LessonScreen() {
  const t = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { content } = useContent();
  const { progress, openLesson, completeLesson, toggleBookmark, setLessonScroll } = useProgress();

  const lesson = useMemo(() => content.lessons.find((l) => l.id === id), [content.lessons, id]);
  const state = lesson ? progress.lessons[lesson.id] : undefined;
  const opened = useRef(false);

  // Mark opened once (awards reading XP, and enables "Continue learning").
  useEffect(() => {
    if (lesson && !opened.current) {
      opened.current = true;
      void openLesson(lesson.id);
    }
  }, [lesson, openLesson]);

  useEffect(() => {
    if (lesson) navigation.setOptions({ title: lesson.kind === 'guide' ? 'Guide' : 'Lesson' });
  }, [lesson, navigation]);

  if (!lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }}>
        <View style={{ padding: t.space.lg }}>
          <TIText variant="h3">Lesson not found</TIText>
          <Button label="Back to Learn" variant="outline" onPress={() => router.replace('/learn')} />
        </View>
      </SafeAreaView>
    );
  }

  const category = content.categories.find((c) => c.id === lesson.categoryId);
  const relatedQuiz = content.quizzes.find((q) => q.id === lesson.relatedQuizId);
  const relatedVideo = content.videos.find((v) => v.id === lesson.relatedVideoId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg, paddingBottom: t.space.xxxl }}
        scrollEventThrottle={250}
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          const scrollable = Math.max(1, contentSize.height - layoutMeasurement.height);
          setLessonScroll(lesson.id, contentOffset.y / scrollable);
        }}
      >
        <View style={{ gap: t.space.sm }}>
          <View style={{ flexDirection: 'row', gap: t.space.sm, flexWrap: 'wrap' }}>
            {category ? <Pill label={category.title} /> : null}
            {lesson.kind === 'guide' ? <Pill label="Guide" tone="accent" /> : null}
            {state?.completed ? <Pill label="✓ Completed" tone="success" /> : null}
          </View>
          <TIText variant="h1">{lesson.title}</TIText>
          <TIText variant="small" tone="muted">
            {lesson.summary}
          </TIText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
            <TIText variant="caption" tone="muted">
              {lesson.readingMinutes} min read · {lesson.xp} XP
            </TIText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={state?.bookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
              onPress={() => void toggleBookmark(lesson.id)}
            >
              <AppIcon size={18} name={state?.bookmarked ? 'bookmark' : 'bookmark-outline'} />
            </Pressable>
          </View>
        </View>

        <BlockRenderer blocks={lesson.body} />

        {/* ------------------------------------------------------------- takeaways */}
        {lesson.keyTakeaways.length ? (
          <Card
            style={{
              backgroundColor: t.colors.subtle,
              borderStyle: 'dashed',
              borderColor: t.colors.tipLine,
              borderWidth: 1,
              gap: t.space.sm,
            }}
          >
            <Text style={{ ...t.type.overline, color: t.colors.brandDark }}>KEY TAKEAWAYS</Text>
            {lesson.keyTakeaways.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: t.space.sm }}>
                <Text style={{ color: t.colors.brandDark, fontWeight: '800' }}>✓</Text>
                <Text style={{ flex: 1, fontSize: 14.5, lineHeight: 21, color: t.colors.ink }}>
                  {item}
                </Text>
              </View>
            ))}
          </Card>
        ) : null}

        {/* ------------------------------------------------- verification + sources */}
        <Card style={{ gap: t.space.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TIText variant="caption" tone="muted">
              Last reviewed {formatDate(lesson.lastReviewed)}
            </TIText>
            {lesson.needsVerification ? <Pill label="Verify yearly" tone="accent" /> : null}
          </View>
          {lesson.needsVerification ? (
            <TIText variant="caption" tone="muted">
              This lesson mentions dates, penalties or limits that change. Always confirm the current
              year on canada.ca.
            </TIText>
          ) : null}
          {lesson.officialSources.length ? (
            <View style={{ gap: 6, marginTop: 4 }}>
              <Text style={{ ...t.type.overline, color: t.colors.muted }}>OFFICIAL SOURCES</Text>
              {lesson.officialSources.map((s) => (
                <Pressable
                  key={s.url}
                  accessibilityRole="link"
                  onPress={() => void Linking.openURL(s.url)}
                >
                  <Text style={{ color: t.colors.brandDark, fontSize: 13.5, fontWeight: '600' }}>
                    {s.label} ↗
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Card>

        {/* ------------------------------------------------------------ next actions */}
        <View style={{ gap: t.space.sm }}>
          {!state?.completed ? (
            <Button
              label="Mark as complete"
              onPress={() => void completeLesson(lesson.id)}
              fullWidth
            />
          ) : null}
          {relatedQuiz ? (
            <Button
              label={`Test yourself: ${relatedQuiz.title}`}
              variant="accent"
              onPress={() => router.push(`/quiz/${relatedQuiz.id}`)}
              fullWidth
            />
          ) : null}
          {relatedVideo ? (
            <Button
              label={`Watch: ${relatedVideo.title}`}
              variant="outline"
              onPress={() => router.push(`/video/${relatedVideo.id}`)}
              fullWidth
            />
          ) : null}
        </View>

        <DisclaimerNote text={DISCLAIMER} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
