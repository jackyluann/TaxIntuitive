import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { QuizQuestion } from '@/content/types';
import { resolveQuizQuestions, weeklyQuestionIds } from '@/lib/content/repository';
import { Button, Card, Pill, ProgressBar, ScoreRing, TIText } from '@/components/ui';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

interface Answered {
  questionId: string;
  chosenIndex: number;
  correct: boolean;
}

/** Solo quiz. Fully offline and graded on-device — no account, no network needed. */
export default function QuizScreen() {
  const t = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { content } = useContent();
  const { recordQuizAttempt } = useProgress();

  const quiz = useMemo(() => content.quizzes.find((q) => q.id === id), [content.quizzes, id]);

  // Bumped by "Try again" to draw a fresh set; otherwise the set is stable for the whole quiz.
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [finished, setFinished] = useState(false);
  const [awarded, setAwarded] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);

  const buildQuestions = useCallback(
    (orderSeed: number) => {
      if (!quiz) return [];
      if (quiz.kind === 'weekly') {
        // The weekly set is fixed for everyone that week, so it is never reshuffled.
        return weeklyQuestionIds(content)
          .map((qid) => content.questions.find((q) => q.id === qid))
          .filter((q): q is QuizQuestion => Boolean(q));
      }
      return resolveQuizQuestions(content, quiz.id, undefined, orderSeed);
    },
    [content, quiz],
  );

  // Pure derivation: the order depends only on (content, quiz, seed), so re-renders never
  // reshuffle and "Try again" gets a genuinely new order by bumping the seed.
  const questions = useMemo(() => buildQuestions(seed), [buildQuestions, seed]);

  useEffect(() => {
    if (quiz) navigation.setOptions({ title: quiz.title });
  }, [quiz, navigation]);

  const question = questions[index];
  const score = answers.filter((a) => a.correct).length;

  const submitAttempt = useCallback(
    async (final: Answered[]) => {
      if (!quiz) return;
      const result = await recordQuizAttempt({
        quizId: quiz.id,
        score: final.filter((a) => a.correct).length,
        total: final.length,
        wrongQuestionIds: final.filter((a) => !a.correct).map((a) => a.questionId),
      });
      setAwarded(result.xpAwarded);
    },
    [quiz, recordQuizAttempt],
  );

  const choose = (optionIndex: number) => {
    if (chosen !== null || !question) return;
    const correct = optionIndex === question.answerIndex;
    setChosen(optionIndex);
    setAnswers((prev) => [...prev, { questionId: question.id, chosenIndex: optionIndex, correct }]);
    void Haptics.notificationAsync(
      correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setChosen(null);
      return;
    }
    setFinished(true);
    void submitAttempt(answers);
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setIndex(0);
    setChosen(null);
    setAnswers([]);
    setFinished(false);
    setAwarded(0);
    setReviewOpen(false);
  };

  if (!quiz || questions.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }}>
        <View style={{ padding: t.space.lg, gap: t.space.md }}>
          <TIText variant="h3">This quiz has no questions yet</TIText>
          <Button label="Back to quizzes" variant="outline" onPress={() => router.replace('/quizzes')} />
        </View>
      </SafeAreaView>
    );
  }

  /* ----------------------------------------------------------------- results view */
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const verdict =
      pct === 100
        ? { title: 'Perfect score! 🏆', body: "You're a certified tax whiz." }
        : pct >= 80
          ? { title: 'Great job! 🎉', body: "You've really got the basics down." }
          : pct >= 60
            ? { title: 'Nice work! 👍', body: "A solid foundation — a quick review and you'll ace it." }
            : pct >= 40
              ? { title: 'Good start! 🌱', body: 'Try the lessons below and give it another go.' }
              : { title: 'Keep going! 💪', body: 'Everyone starts somewhere. Review and try again.' };

    const wrong = answers.filter((a) => !a.correct);
    const recommended = Array.from(
      new Set(
        wrong
          .map((a) => content.questions.find((q) => q.id === a.questionId)?.teachesLessonId)
          .filter((x): x is string => Boolean(x)),
      ),
    )
      .map((lid) => content.lessons.find((l) => l.id === lid))
      .filter((l): l is NonNullable<typeof l> => Boolean(l));

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg }}>
          <Card style={{ alignItems: 'center', gap: t.space.sm }}>
            <ScoreRing value={pct} label={`${score} / ${questions.length}`} />
            <TIText variant="h2" center>
              {verdict.title}
            </TIText>
            <TIText variant="small" tone="muted" center>
              {verdict.body}
            </TIText>
            {awarded > 0 ? <Pill label={`+${awarded} XP`} tone="success" /> : null}
          </Card>

          <View style={{ gap: t.space.sm }}>
            <Button label="Try again" onPress={restart} fullWidth />
            <Button
              label={reviewOpen ? 'Hide review' : 'Review answers'}
              variant="ghost"
              onPress={() => setReviewOpen((v) => !v)}
              fullWidth
            />
            <Button
              label="All quizzes"
              variant="outline"
              onPress={() => router.replace('/quizzes')}
              fullWidth
            />
          </View>

          {recommended.length ? (
            <View style={{ gap: t.space.sm }}>
              <Text style={{ ...t.type.overline, color: t.colors.muted }}>
                RECOMMENDED LESSONS
              </Text>
              {recommended.map((lesson) => (
                <Card key={lesson.id} onPress={() => router.push(`/lesson/${lesson.id}`)}>
                  <TIText variant="bodyStrong">{lesson.title}</TIText>
                  <TIText variant="caption" tone="muted">
                    {lesson.summary}
                  </TIText>
                </Card>
              ))}
            </View>
          ) : null}

          {reviewOpen ? (
            <View style={{ gap: t.space.sm }}>
              {answers.map((a, i) => {
                const q = content.questions.find((x) => x.id === a.questionId);
                if (!q) return null;
                return (
                  <Card key={a.questionId} style={{ gap: 4 }}>
                    <TIText variant="bodyStrong">
                      {i + 1}. {q.prompt}
                    </TIText>
                    <TIText variant="small" tone={a.correct ? 'success' : 'danger'}>
                      {a.correct
                        ? '✓ You got it right'
                        : `✕ You chose: ${LETTERS[a.chosenIndex]}) ${q.options[a.chosenIndex]}`}
                    </TIText>
                    <TIText variant="small" tone="success">
                      Answer: {LETTERS[q.answerIndex]}) {q.options[q.answerIndex]}
                    </TIText>
                    <TIText variant="caption" tone="muted">
                      {q.explanation}
                    </TIText>
                  </Card>
                );
              })}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------------------- question view */
  const isCorrectChoice = chosen !== null && chosen === question.answerIndex;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg }}>
        <View style={{ gap: t.space.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pill label={quiz.title} />
            <TIText variant="caption" tone="muted">
              {index + 1} / {questions.length}
            </TIText>
          </View>
          <ProgressBar value={index / questions.length} />
        </View>

        <TIText variant="h2">{question.prompt}</TIText>

        <View style={{ gap: t.space.sm }}>
          {question.options.map((option, i) => {
            const isChosen = chosen === i;
            const isAnswer = question.answerIndex === i;
            const revealed = chosen !== null;

            const bg = revealed
              ? isAnswer
                ? t.colors.successBg
                : isChosen
                  ? t.colors.dangerBg
                  : t.colors.card
              : t.colors.card;
            const border = revealed
              ? isAnswer
                ? t.colors.success
                : isChosen
                  ? t.colors.danger
                  : t.colors.line
              : t.colors.line;

            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityState={{ disabled: revealed, selected: isChosen }}
                disabled={revealed}
                onPress={() => choose(i)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.space.md,
                  backgroundColor: bg,
                  borderWidth: 1.5,
                  borderColor: border,
                  borderRadius: t.radius.lg,
                  padding: t.space.lg,
                  minHeight: 56,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    backgroundColor:
                      revealed && isAnswer
                        ? t.colors.success
                        : revealed && isChosen
                          ? t.colors.danger
                          : t.colors.tipBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: '800',
                      fontSize: 14,
                      color:
                        revealed && (isAnswer || isChosen) ? '#FFFFFF' : t.colors.brandDark,
                    }}
                  >
                    {revealed && isAnswer ? '✓' : revealed && isChosen ? '✕' : LETTERS[i]}
                  </Text>
                </View>
                <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: t.colors.ink }}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {chosen !== null ? (
          <Card
            style={{
              backgroundColor: isCorrectChoice ? t.colors.successBg : t.colors.dangerBg,
              borderColor: isCorrectChoice ? t.colors.success : t.colors.danger,
              gap: 4,
            }}
          >
            <TIText variant="bodyStrong" tone={isCorrectChoice ? 'success' : 'danger'}>
              {isCorrectChoice ? '✓ Correct!' : '✕ Not quite'}
            </TIText>
            <TIText variant="small">{question.explanation}</TIText>
          </Card>
        ) : null}

        {chosen !== null ? (
          <Button
            label={index === questions.length - 1 ? 'See results →' : 'Next →'}
            onPress={next}
            fullWidth
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
