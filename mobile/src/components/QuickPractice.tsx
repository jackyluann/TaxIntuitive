import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useContent } from '@/providers/content';
import { useTheme } from '@/theme';
import type { QuizQuestion } from '@/content/types';
import { AppIcon } from './AppIcon';
import { Button, Card, Pill, TIText } from './ui';

/** Low-pressure practice: no score writes or duplicate XP awards. */
export function QuickPractice() {
  const { content } = useContent();
  const [index, setIndex] = useState(0);
  const question = content.questions[index % Math.max(content.questions.length, 1)];
  if (!question) return null;
  return <PracticeQuestion key={JSON.stringify(question)} question={question}
    lessonAvailable={content.lessons.some(l => l.id === question.teachesLessonId)}
    canAdvance={content.questions.length > 1} onNext={() => setIndex(i => i + 1)} />;
}

export function PracticeQuestion({ question, onNext, canAdvance, lessonAvailable }: {
  question: QuizQuestion; onNext: () => void; canAdvance: boolean; lessonAvailable: boolean;
}) {
  const t = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;
  return <Card style={{ gap: t.space.md }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.sm }}>
      <AppIcon name="bulb-outline" />
      <Pill label="Quick practice" />
    </View>
    <TIText variant="h3">{question.prompt}</TIText>
    <TIText variant="caption" tone="muted">Try an answer. No timer, no XP — just a useful takeaway.</TIText>
    {question.options.map((option, i) => {
      const correct = revealed && i === question.answerIndex;
      const wrong = revealed && i === selected && !correct;
      return <Pressable key={i} accessibilityRole="button" accessibilityLabel={option}
        accessibilityState={{ disabled: revealed, selected: selected === i }} disabled={revealed}
        onPress={() => setSelected(i)} style={({ pressed }) => ({
          minHeight: 52, padding: t.space.md, borderRadius: t.radius.md, borderWidth: 1,
          borderColor: correct ? t.colors.success : wrong ? t.colors.danger : t.colors.line,
          backgroundColor: correct ? t.colors.successBg : wrong ? t.colors.dangerBg : pressed ? t.colors.tipBg : t.colors.subtle,
          flexDirection: 'row', gap: t.space.md, alignItems: 'center',
        })}>
        <AppIcon name={correct ? 'checkmark-circle-outline' : wrong ? 'close-circle-outline' : 'ellipse-outline'} size={20} color={correct ? t.colors.success : wrong ? t.colors.danger : t.colors.muted} />
        <TIText variant="small" style={{ flex: 1 }}>{option}</TIText>
      </Pressable>;
    })}
    {revealed ? <View accessibilityLiveRegion="polite" style={{ gap: t.space.md }}>
      <TIText variant="bodyStrong">{selected === question.answerIndex ? 'You got it.' : 'A useful one to remember.'}</TIText>
      <TIText variant="small">Correct answer: {question.options[question.answerIndex]}</TIText>
      <TIText variant="small" tone="muted">{question.explanation}</TIText>
      {lessonAvailable && question.teachesLessonId ? <Button label="Explore the lesson" variant="outline" onPress={() => router.push(`/lesson/${question.teachesLessonId}`)} /> : null}
      {canAdvance ? <Button label="Try another question" onPress={onNext} /> : null}
    </View> : null}
  </Card>;
}
