import React from 'react';
import { Text, Pressable } from 'react-native';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bundledContent } from '@/content';
import { AuthProvider } from '@/providers/auth';
import { ContentProvider } from '@/providers/content';
import { ProgressProvider, useProgress } from '@/providers/progress';

/**
 * Integration test: providers + XP engine + local persistence working together,
 * exactly as a guest would experience it (no Supabase configured).
 */

const lesson = bundledContent.lessons[0];
const quiz = bundledContent.quizzes.find((q) => q.id === 'quiz-tax-basics')!;

function Harness() {
  const { stats, progress, openLesson, completeLesson, recordQuizAttempt, toggleBookmark } =
    useProgress();
  return (
    <>
      <Text testID="xp">{stats.totalXp}</Text>
      <Text testID="level">{stats.level}</Text>
      <Text testID="done">{stats.lessonsCompleted}</Text>
      <Text testID="passed">{stats.quizzesPassed}</Text>
      <Text testID="score">{stats.literacyScore}</Text>
      <Text testID="bookmarked">
        {String(Boolean(progress.lessons[lesson.id]?.bookmarked))}
      </Text>
      <Pressable testID="open" onPress={() => void openLesson(lesson.id)}>
        <Text>open</Text>
      </Pressable>
      <Pressable testID="complete" onPress={() => void completeLesson(lesson.id)}>
        <Text>complete</Text>
      </Pressable>
      <Pressable testID="bookmark" onPress={() => void toggleBookmark(lesson.id)}>
        <Text>bookmark</Text>
      </Pressable>
      <Pressable
        testID="quiz"
        onPress={() =>
          void recordQuizAttempt({
            quizId: quiz.id,
            score: 5,
            total: 5,
            wrongQuestionIds: [],
          })
        }
      >
        <Text>quiz</Text>
      </Pressable>
    </>
  );
}

const renderHarness = () =>
  render(
    <ContentProvider>
      <AuthProvider>
        <ProgressProvider>
          <Harness />
        </ProgressProvider>
      </AuthProvider>
    </ContentProvider>,
  );

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('guest progress end to end', () => {
  it('starts at zero', async () => {
    renderHarness();
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'));
    expect(screen.getByTestId('level')).toHaveTextContent('1');
    expect(screen.getByTestId('done')).toHaveTextContent('0');
  });

  it('awards reading XP once, no matter how often a lesson is opened', async () => {
    renderHarness();
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('open'));
    });
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('2'));

    // Opening again must not grant more XP.
    await act(async () => {
      fireEvent.press(screen.getByTestId('open'));
    });
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('2'));
  });

  it('awards the lesson value on completion and counts it once', async () => {
    renderHarness();
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('complete'));
    });
    await waitFor(() => expect(screen.getByTestId('done')).toHaveTextContent('1'));
    expect(screen.getByTestId('xp')).toHaveTextContent(String(lesson.xp));

    await act(async () => {
      fireEvent.press(screen.getByTestId('complete'));
    });
    await waitFor(() => expect(screen.getByTestId('done')).toHaveTextContent('1'));
    expect(screen.getByTestId('xp')).toHaveTextContent(String(lesson.xp));
  });

  it('records a perfect quiz with pass, perfect and streak bonuses', async () => {
    renderHarness();
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('quiz'));
    });

    await waitFor(() => expect(screen.getByTestId('passed')).toHaveTextContent('1'));
    // 5 correct x 4 XP + 10 perfect bonus + 5 streak-day bonus
    expect(screen.getByTestId('xp')).toHaveTextContent('35');
  });

  it('raises the literacy score as real work is done', async () => {
    renderHarness();
    await waitFor(() => expect(screen.getByTestId('score')).toHaveTextContent('0'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('quiz'));
    });
    await waitFor(() => {
      const text = screen.getByTestId('score').children.join('');
      expect(Number(text)).toBeGreaterThan(0);
    });
  });

  it('toggles a bookmark without awarding XP', async () => {
    renderHarness();
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('bookmark'));
    });
    await waitFor(() => expect(screen.getByTestId('bookmarked')).toHaveTextContent('true'));
    expect(screen.getByTestId('xp')).toHaveTextContent('0');
  });

  it('writes progress to local storage as it happens', async () => {
    renderHarness();
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('complete'));
    });
    await waitFor(() => expect(screen.getByTestId('done')).toHaveTextContent('1'));

    // The write is what makes guest progress survive an app restart.
    await waitFor(async () => {
      const raw = await AsyncStorage.getItem('ti.progress.v1');
      expect(raw).toBeTruthy();
      const stored = JSON.parse(raw!);
      expect(stored.lessons[lesson.id].completed).toBe(true);
      expect(stored.xpEvents.length).toBeGreaterThan(0);
    });
  });

  it('hydrates saved progress on a fresh launch', async () => {
    // Simulate a previous session already stored on the device.
    await AsyncStorage.setItem(
      'ti.progress.v1',
      JSON.stringify({
        xpEvents: [
          {
            id: 'x1',
            reason: 'lesson_completed',
            xp: 10,
            trackId: 'taxes',
            refId: lesson.id,
            at: '2026-09-19T00:00:00.000Z',
          },
        ],
        lessons: {
          [lesson.id]: { opened: true, completed: true, bookmarked: true },
        },
        quizAttempts: [],
        videos: {},
        simulatorRuns: [],
        duo: { wins: 0, losses: 0, ties: 0 },
        activeDates: ['2026-09-19'],
      }),
    );

    renderHarness();

    await waitFor(() => expect(screen.getByTestId('done')).toHaveTextContent('1'));
    expect(screen.getByTestId('xp')).toHaveTextContent('10');
    expect(screen.getByTestId('bookmarked')).toHaveTextContent('true');
  });
});
