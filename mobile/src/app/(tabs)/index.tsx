import React from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/AppIcon';
import { QuickPractice } from '@/components/QuickPractice';
import { Button, Card, DisclaimerNote, Pill, ProgressBar, SectionTitle, StatTile, TIText } from '@/components/ui';
import { DISCLAIMER } from '@/content';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useAuth } from '@/providers/auth';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const { content } = useContent();
  const { stats, continueLessonId, progress } = useProgress();
  const { displayName } = useAuth();
  const nextLesson = content.lessons.find(l => l.id === continueLessonId && !progress.lessons[l.id]?.completed)
    ?? [...content.lessons].sort((a, b) => a.order - b.order).find(l => !progress.lessons[l.id]?.completed);
  const completed = content.lessons.filter(l => progress.lessons[l.id]?.completed).length;
  const weekly = content.quizzes.find(q => q.kind === 'weekly');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: t.space.xl, gap: t.space.xl, paddingBottom: t.space.xxxl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
          <View style={{ padding: 12, backgroundColor: t.colors.tipBg, borderRadius: t.radius.md }}>
            <AppIcon name="leaf-outline" size={26} />
          </View>
          <View style={{ flex: 1 }}>
            <TIText variant="h3">TaxIntuitive</TIText>
            <TIText variant="caption" tone="muted">Small steps. Money confidence.</TIText>
          </View>
          <Pill label={`${stats.streakDays} day streak`} />
        </View>
        <View style={{ gap: t.space.sm }}>
          <TIText variant="caption" tone="muted">{displayName ? `WELCOME BACK, ${displayName.toUpperCase()}` : 'YOUR NEXT CHAPTER'}</TIText>
          <TIText variant="display">Make money make sense.</TIText>
          <TIText tone="muted">One useful lesson. One confident decision at a time.</TIText>
        </View>
        <Card style={{ gap: t.space.md, borderColor: t.colors.brand, padding: t.space.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pill label={nextLesson ? 'Your next step' : 'Core lessons complete'} />
            <AppIcon name={nextLesson ? 'book-outline' : 'checkmark-circle-outline'} />
          </View>
          <TIText variant="h2">{nextLesson?.title ?? 'Put your knowledge to work'}</TIText>
          <TIText variant="small" tone="muted">{nextLesson?.summary ?? 'Try a quiz or explore a different choice in the money simulator.'}</TIText>
          {nextLesson ? <TIText variant="caption" tone="brand">{nextLesson.readingMinutes} min · {nextLesson.xp} XP on completion</TIText> : null}
          <Button label={nextLesson ? (progress.lessons[nextLesson.id]?.scrollProgress ? 'Continue lesson' : 'Start lesson') : 'Explore quizzes'} onPress={() => router.push(nextLesson ? `/lesson/${nextLesson.id}` : '/quizzes')} />
          <ProgressBar value={completed / Math.max(content.lessons.length, 1)} />
          <TIText variant="caption" tone="muted">{completed} of {content.lessons.length} lessons complete</TIText>
        </Card>
        <SectionTitle>Build your momentum</SectionTitle>
        <View style={{ flexDirection: 'row', gap: t.space.sm }}>
          <StatTile label="Total XP" value={stats.totalXp.toLocaleString('en-CA')} />
          <StatTile label="Level" value={String(stats.level)} tone="ink" />
        </View>
        <QuickPractice />
        <SectionTitle>Learn by doing</SectionTitle>
        <Card onPress={() => router.push('/simulator')} accessibilityLabel="Play the money simulator">
          <View style={{ flexDirection: 'row', gap: t.space.md, alignItems: 'center' }}>
            <AppIcon name="game-controller-outline" size={32} />
            <View style={{ flex: 1, gap: 4 }}>
              <TIText variant="h3">Your first year, your choices</TIText>
              <TIText variant="small" tone="muted">Rent, paycheques, unexpected costs. See where your decisions take you.</TIText>
            </View>
            <AppIcon name="chevron-forward" size={18} />
          </View>
        </Card>
        {weekly ? <Card onPress={() => router.push(`/quiz/${weekly.id}`)} accessibilityLabel="Start the weekly quiz">
          <View style={{ flexDirection: 'row', gap: t.space.md, alignItems: 'center' }}>
            <AppIcon name="flash-outline" size={28} />
            <View style={{ flex: 1, gap: 4 }}>
              <TIText variant="h3">Your weekly challenge</TIText>
              <TIText variant="small" tone="muted">Test what stuck. Learn something new.</TIText>
            </View>
            <AppIcon name="chevron-forward" size={18} />
          </View>
        </Card> : null}
        <DisclaimerNote text={DISCLAIMER} />
      </ScrollView>
    </SafeAreaView>
  );
}
