import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DISCLAIMER } from '@/content';
import { Button, Card, DisclaimerNote, Pill, TIText } from '@/components/ui';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';

export default function VideoScreen() {
  const t = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { content } = useContent();
  const { progress, completeVideo } = useProgress();
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const video = useMemo(() => content.videos.find((v) => v.id === id), [content.videos, id]);

  useEffect(() => {
    if (video) navigation.setOptions({ title: video.category });
  }, [video, navigation]);

  if (!video) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }}>
        <View style={{ padding: t.space.lg, gap: t.space.md }}>
          <TIText variant="h3">Video not found</TIText>
          <Button label="Back to videos" variant="outline" onPress={() => router.replace('/videos')} />
        </View>
      </SafeAreaView>
    );
  }

  const watched = progress.videos[video.id]?.completed;
  const lesson = content.lessons.find((l) => l.id === video.relatedLessonId);
  const quiz = content.quizzes.find((q) => q.id === video.relatedQuizId);
  const published = video.youtubeId.trim().length > 0;
  const watchUrl = published ? `https://www.youtube.com/watch?v=${video.youtubeId}` : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg }}>
        {/* Player placeholder / launcher.
            Deliberately opens YouTube rather than embedding: an embed needs a WebView, and
            YouTube's terms + captions/transcripts work better in the native app. */}
        <View
          style={{
            aspectRatio: 16 / 9,
            borderRadius: t.radius.xl,
            backgroundColor: t.colors.brandDark,
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.space.sm,
            overflow: 'hidden',
          }}
        >
          <Text style={{ fontSize: 40, color: t.colors.onBrand }}>▶</Text>
          <Text style={{ color: t.colors.onBrand, fontWeight: '800', fontSize: 15 }}>
            {published ? 'Tap play to watch' : 'Episode coming soon'}
          </Text>
          {!published ? (
            <Text
              style={{
                color: t.colors.onBrand,
                opacity: 0.85,
                fontSize: 12.5,
                textAlign: 'center',
                paddingHorizontal: t.space.xl,
              }}
            >
              This expert answer is on the way.
            </Text>
          ) : null}
        </View>

        <View style={{ gap: t.space.sm }}>
          <View style={{ flexDirection: 'row', gap: t.space.sm, flexWrap: 'wrap' }}>
            <Pill label={video.category} />
            {watched ? <Pill label="✓ Watched" tone="success" /> : null}
            {video.captionsAvailable ? <Pill label="CC" tone="muted" /> : null}
          </View>
          <TIText variant="h1">{video.title}</TIText>
          <TIText variant="bodyStrong" tone="muted">
            {video.question}
          </TIText>
          <TIText variant="small" tone="muted">
            {video.description}
          </TIText>
        </View>

        {published ? (
          <View style={{ gap: t.space.sm }}>
            <Button
              label="Watch on YouTube"
              onPress={() => watchUrl && void Linking.openURL(watchUrl)}
              fullWidth
            />
            {!watched ? (
              <Button
                label={`Mark as watched (+${video.xp} XP)`}
                variant="ghost"
                onPress={() => void completeVideo(video.id)}
                fullWidth
              />
            ) : null}
          </View>
        ) : (
          <Card style={{ gap: t.space.sm }}>
            <TIText variant="bodyStrong">Got a tax question of your own?</TIText>
            <TIText variant="small" tone="muted">
              Send it in and it might become the next episode.
            </TIText>
            <Button label="Ask a question" variant="accent" onPress={() => router.push('/about')} />
          </Card>
        )}

        {video.transcript ? (
          <Card style={{ gap: t.space.sm }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setTranscriptOpen((v) => !v)}
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <TIText variant="bodyStrong">Transcript</TIText>
              <Text style={{ color: t.colors.brandDark, fontWeight: '800' }}>
                {transcriptOpen ? '−' : '+'}
              </Text>
            </Pressable>
            {transcriptOpen ? <TIText variant="small">{video.transcript}</TIText> : null}
          </Card>
        ) : null}

        {lesson || quiz ? (
          <View style={{ gap: t.space.sm }}>
            <Text style={{ ...t.type.overline, color: t.colors.muted }}>KEEP GOING</Text>
            {lesson ? (
              <Card onPress={() => router.push(`/lesson/${lesson.id}`)}>
                <TIText variant="caption" tone="brand">
                  LESSON
                </TIText>
                <TIText variant="bodyStrong">{lesson.title}</TIText>
              </Card>
            ) : null}
            {quiz ? (
              <Card onPress={() => router.push(`/quiz/${quiz.id}`)}>
                <TIText variant="caption" tone="brand">
                  QUIZ
                </TIText>
                <TIText variant="bodyStrong">{quiz.title}</TIText>
              </Card>
            ) : null}
          </View>
        ) : null}

        <DisclaimerNote text={DISCLAIMER} />
      </ScrollView>
    </SafeAreaView>
  );
}
