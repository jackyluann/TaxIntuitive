import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DISCLAIMER } from '@/content';
import { weeklyQuestionIds } from '@/lib/content/repository';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useAuth } from '@/providers/auth';
import { useTheme } from '@/theme';
import {
  Button,
  Card,
  DisclaimerNote,
  Pill,
  ProgressBar,
  SectionTitle,
  StatTile,
  TIText,
} from '@/components/ui';

/**
 * Home = mobile dashboard (not the website homepage).
 *
 * Deliberately omitted from the website: the "100% / 500k+ / 90%" statistics, which are not
 * verifiable for this project. See CONTENT-REVIEW.md.
 */
export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const { content } = useContent();
  const { stats, continueLessonId, progress } = useProgress();
  const { isGuest, displayName } = useAuth();

  const continueLesson = useMemo(
    () => content.lessons.find((l) => l.id === continueLessonId) ?? null,
    [content.lessons, continueLessonId],
  );

  const featuredGuide = useMemo(
    () => content.lessons.find((l) => l.kind === 'guide' && l.featured) ?? content.lessons[0],
    [content.lessons],
  );

  const featuredVideo = useMemo(
    () => content.videos.find((v) => v.featured) ?? content.videos[0],
    [content.videos],
  );

  const weeklyCount = useMemo(() => weeklyQuestionIds(content).length, [content]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg, paddingBottom: t.space.xxxl }}>
        {/* ------------------------------------------------------------- brand header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              backgroundColor: t.colors.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: t.colors.onBrand, fontWeight: '800', fontSize: 22 }}>T</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: t.colors.ink, letterSpacing: -0.3 }}>
              Tax<Text style={{ color: t.colors.brandDark }}>Intuitive</Text>
            </Text>
            <TIText variant="caption" tone="muted">
              {displayName ? `Welcome back, ${displayName}` : 'Tax Basics Made Simple'}
            </TIText>
          </View>
        </View>

        {/* -------------------------------------------------------------------- hero */}
        <Card style={{ backgroundColor: t.colors.brandDark, borderColor: t.colors.brandDark, gap: t.space.md }}>
          <Text style={{ ...t.type.overline, color: t.colors.onBrand, opacity: 0.9 }}>
            FINANCIAL LITERACY FOR THE NEXT GENERATION
          </Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: t.colors.onBrand, letterSpacing: -0.6 }}>
            Tax Basics Made Simple
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: t.colors.onBrand, opacity: 0.95 }}>
            Learn to file your taxes with confidence. Taxes and money in plain language, built for
            young Canadians.
          </Text>
          <View style={{ flexDirection: 'row', gap: t.space.sm, flexWrap: 'wrap' }}>
            <Button
              label="Start learning"
              variant="ghost"
              onPress={() => router.push('/learn')}
              style={{ flexGrow: 1 }}
            />
            <Button
              label="Start quiz"
              variant="accent"
              onPress={() => router.push('/quizzes')}
              style={{ flexGrow: 1 }}
            />
          </View>
        </Card>

        {/* --------------------------------------------------------- continue learning */}
        {continueLesson ? (
          <>
            <SectionTitle>Continue learning</SectionTitle>
            <Card onPress={() => router.push(`/lesson/${continueLesson.id}`)} accessibilityLabel={`Continue ${continueLesson.title}`}>
              <View style={{ gap: t.space.sm }}>
                <Pill label={categoryTitle(content, continueLesson.categoryId)} />
                <TIText variant="h3">{continueLesson.title}</TIText>
                <ProgressBar value={progress.lessons[continueLesson.id]?.scrollProgress ?? 0} />
                <TIText variant="caption" tone="muted">
                  {Math.round((progress.lessons[continueLesson.id]?.scrollProgress ?? 0) * 100)}% read
                  · {continueLesson.readingMinutes} min
                </TIText>
              </View>
            </Card>
          </>
        ) : null}

        {/* ------------------------------------------------------------------ progress */}
        <SectionTitle
          action={
            <Pressable onPress={() => router.push('/xp')} accessibilityRole="button">
              <TIText variant="caption" tone="brand">
                View tracker
              </TIText>
            </Pressable>
          }
        >
          Your progress
        </SectionTitle>
        <View style={{ flexDirection: 'row', gap: t.space.md }}>
          <StatTile label="XP earned" value={stats.totalXp.toLocaleString('en-CA')} />
          <StatTile label="Literacy score" value={`${stats.literacyScore}%`} tone="accent" />
          <StatTile label="Streak" value={`${stats.streakDays}d`} tone="ink" />
        </View>
        <Card>
          <View style={{ gap: t.space.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TIText variant="bodyStrong">
                Level {stats.level} · {stats.levelTitle}
              </TIText>
              <TIText variant="caption" tone="muted">
                {stats.xpForNextLevel === null
                  ? 'Max level'
                  : `${stats.xpForNextLevel - stats.xpIntoLevel} XP to go`}
              </TIText>
            </View>
            <ProgressBar
              value={
                stats.xpForNextLevel === null ? 1 : stats.xpIntoLevel / stats.xpForNextLevel
              }
            />
          </View>
        </Card>

        {/* ----------------------------------------------------------- quiz of the week */}
        <SectionTitle>Test your tax wit</SectionTitle>
        <Card onPress={() => router.push('/quiz/quiz-weekly')} accessibilityLabel="Quiz of the Week">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
            <Text style={{ fontSize: 32 }}>⚡</Text>
            <View style={{ flex: 1 }}>
              <TIText variant="h3">Quiz of the Week</TIText>
              <TIText variant="small" tone="muted">
                {weeklyCount} questions · new set every week
              </TIText>
            </View>
            <Text style={{ color: t.colors.muted, fontSize: 20 }}>›</Text>
          </View>
        </Card>

        {/* ------------------------------------------------------------- quick access */}
        <SectionTitle>Quick access</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.md }}>
          <QuickTile emoji="🎮" label="Simulator" onPress={() => router.push('/simulator')} />
          <QuickTile emoji="🤝" label="Quiz Duo" onPress={() => router.push('/duo')} />
          <QuickTile emoji="🏅" label="XP Tracker" onPress={() => router.push('/xp')} />
          <QuickTile emoji="🎓" label="Workshops" onPress={() => router.push('/workshops')} />
        </View>

        {/* ---------------------------------------------------------- featured content */}
        {featuredGuide ? (
          <>
            <SectionTitle>Featured guide</SectionTitle>
            <Card onPress={() => router.push(`/lesson/${featuredGuide.id}`)}>
              <View style={{ gap: t.space.xs }}>
                <Pill label="Guide" tone="accent" />
                <TIText variant="h3">{featuredGuide.title}</TIText>
                <TIText variant="small" tone="muted">
                  {featuredGuide.summary}
                </TIText>
                <TIText variant="caption" tone="brand">
                  {featuredGuide.readingMinutes} min read →
                </TIText>
              </View>
            </Card>
          </>
        ) : null}

        {featuredVideo ? (
          <>
            <SectionTitle>Featured expert video</SectionTitle>
            <Card onPress={() => router.push(`/video/${featuredVideo.id}`)}>
              <View style={{ gap: t.space.xs }}>
                <Pill
                  label={featuredVideo.youtubeId ? featuredVideo.category : 'Coming soon'}
                  tone={featuredVideo.youtubeId ? 'brand' : 'muted'}
                />
                <TIText variant="h3">{featuredVideo.title}</TIText>
                <TIText variant="small" tone="muted">
                  {featuredVideo.question}
                </TIText>
              </View>
            </Card>
          </>
        ) : null}

        {/* ------------------------------------------------------------- guest nudge */}
        {isGuest ? (
          <Card style={{ gap: t.space.sm }}>
            <TIText variant="bodyStrong">Using TaxIntuitive as a guest</TIText>
            <TIText variant="small" tone="muted">
              Everything here works without an account, and your progress is saved on this device.
              Create an account only if you want Quiz Duo, or to sync across devices.
            </TIText>
            <Button
              label="Create an account"
              variant="outline"
              onPress={() => router.push('/auth/sign-up')}
            />
          </Card>
        ) : null}

        <DisclaimerNote text={DISCLAIMER} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickTile({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flexGrow: 1,
        flexBasis: '45%',
        backgroundColor: t.colors.card,
        borderRadius: t.radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.colors.line,
        padding: t.space.lg,
        alignItems: 'center',
        gap: 6,
        opacity: pressed ? 0.85 : 1,
        ...t.shadow,
      })}
    >
      <Text style={{ fontSize: 26 }}>{emoji}</Text>
      <Text style={{ fontWeight: '700', fontSize: 14, color: t.colors.ink }}>{label}</Text>
    </Pressable>
  );
}

function categoryTitle(content: ReturnType<typeof useContent>['content'], id: string) {
  return content.categories.find((c) => c.id === id)?.title ?? 'Lesson';
}
