import { AppIcon } from '@/components/AppIcon';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useAuth } from '@/providers/auth';
import { useTheme } from '@/theme';
import { resolveQuizQuestions } from '@/lib/content/repository';
import { Button, Card, Pill, Screen, SectionTitle, StatTile, TIText } from '@/components/ui';

export default function QuizzesScreen() {
  const t = useTheme();
  const router = useRouter();
  const { content } = useContent();
  const { progress, stats } = useProgress();
  const { isGuest } = useAuth();

  const bestByQuiz = useMemo(() => {
    const map = new Map<string, { score: number; total: number }>();
    for (const a of progress.quizAttempts) {
      const prev = map.get(a.quizId);
      if (!prev || a.score > prev.score) map.set(a.quizId, { score: a.score, total: a.total });
    }
    return map;
  }, [progress.quizAttempts]);

  const weekly = content.quizzes.find((q) => q.kind === 'weekly');
  const topics = content.quizzes.filter((q) => q.kind === 'topic').sort((a, b) => a.order - b.order);
  const challenges = content.quizzes.filter((q) => q.kind === 'challenge');

  return (
    <Screen>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="h2">Tax Trivia & Quizzes 🇨🇦</TIText>
        <TIText variant="small" tone="muted">
          Test your tax smarts in plain language. Every answer comes with a simple explanation — and
          points you at the lesson that covers it.
        </TIText>
      </Card>

      <View style={{ flexDirection: 'row', gap: t.space.md }}>
        <StatTile label="Quizzes passed" value={`${stats.quizzesPassed}`} />
        <StatTile
          label="Accuracy"
          value={stats.quizAccuracy === null ? '—' : `${Math.round(stats.quizAccuracy * 100)}%`}
          tone="accent"
        />
        <StatTile label="Perfect" value={`${stats.perfectQuizzes}`} tone="ink" />
      </View>

      {weekly ? (
        <>
          <SectionTitle>This week</SectionTitle>
          <Card onPress={() => router.push(`/quiz/${weekly.id}`)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
              <AppIcon size={32} name={weekly.emoji} />
              <View style={{ flex: 1, gap: 2 }}>
                <TIText variant="h3">{weekly.title}</TIText>
                <TIText variant="small" tone="muted">
                  {weekly.description}
                </TIText>
              </View>
            </View>
          </Card>
        </>
      ) : null}

      <SectionTitle>Quiz Duo</SectionTitle>
      <Card style={{ gap: t.space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
          <AppIcon size={30} name="people-outline" />
          <View style={{ flex: 1 }}>
            <TIText variant="h3">Challenge a friend</TIText>
            <TIText variant="small" tone="muted">
              Two players, same questions, live scoring.
            </TIText>
          </View>
        </View>
        {isGuest ? (
          <TIText variant="caption" tone="muted">
            Quiz Duo requires an account so we can connect you with another player, save match
            results, and keep scoring fair.
          </TIText>
        ) : null}
        <Button label="Open Quiz Duo" variant="accent" onPress={() => router.push('/duo')} />
      </Card>

      <SectionTitle>Topics</SectionTitle>
      {topics.map((quiz) => {
        const count = resolveQuizQuestions(content, quiz.id).length;
        const best = bestByQuiz.get(quiz.id);
        return (
          <Card key={quiz.id} onPress={() => router.push(`/quiz/${quiz.id}`)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
              <AppIcon size={26} name={quiz.emoji} />
              <View style={{ flex: 1, gap: 3 }}>
                <TIText variant="bodyStrong">{quiz.title}</TIText>
                <TIText variant="caption" tone="muted">
                  {quiz.description}
                </TIText>
                <TIText variant="caption" tone="muted">
                  {count} questions
                </TIText>
              </View>
              {best ? <Pill label={`Best ${best.score}/${best.total}`} tone="success" /> : null}
            </View>
          </Card>
        );
      })}

      {challenges.length ? (
        <>
          <SectionTitle>Knowledge challenge</SectionTitle>
          {challenges.map((quiz) => (
            <Card key={quiz.id} onPress={() => router.push(`/quiz/${quiz.id}`)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
                <AppIcon size={26} name={quiz.emoji} />
                <View style={{ flex: 1, gap: 3 }}>
                  <TIText variant="bodyStrong">{quiz.title}</TIText>
                  <TIText variant="caption" tone="muted">
                    {quiz.description}
                  </TIText>
                  <TIText variant="caption" tone="muted">
                    {resolveQuizQuestions(content, quiz.id).length} questions
                  </TIText>
                </View>
              </View>
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}
