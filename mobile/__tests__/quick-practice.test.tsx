import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { PracticeQuestion } from '@/components/QuickPractice';
import { ThemeProvider } from '@/theme';
import type { QuizQuestion } from '@/content/types';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/components/AppIcon', () => ({ AppIcon: () => null }));
const question: QuizQuestion = {
  id: 'practice', categoryId: 'tax-basics', prompt: 'Pick the useful habit',
  options: ['Keep records', 'Discard records'], answerIndex: 0,
  explanation: 'Keeping records helps you prepare.', teachesLessonId: 'lesson-tax-basics',
};
afterEach(() => { cleanup(); jest.clearAllMocks(); });

it('reveals the correct answer after a mistake and locks both choices', async () => {
  await render(<ThemeProvider><PracticeQuestion question={question} canAdvance lessonAvailable onNext={jest.fn()} /></ThemeProvider>);
  expect(screen.queryByText(question.explanation)).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Discard records' }));
  expect(screen.getByText('A useful one to remember.')).toBeTruthy();
  expect(screen.getByText('Correct answer: Keep records')).toBeTruthy();
  expect(screen.getByText(question.explanation)).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Keep records' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Discard records' })).toBeDisabled();
  await fireEvent.press(screen.getByText('Explore the lesson'));
  expect(mockPush).toHaveBeenCalledWith('/lesson/lesson-tax-basics');
});

it('advances only on request and resets answers for the next question', async () => {
  const onNext = jest.fn();
  const view = await render(<ThemeProvider><PracticeQuestion key="first" question={question} canAdvance lessonAvailable={false} onNext={onNext} /></ThemeProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Keep records' }));
  expect(screen.getByText('You got it.')).toBeTruthy();
  expect(screen.queryByText('Explore the lesson')).toBeNull();
  expect(onNext).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText('Try another question'));
  expect(onNext).toHaveBeenCalledTimes(1);
  await view.rerender(<ThemeProvider><PracticeQuestion key="second" question={{ ...question, id: 'next' }} canAdvance={false} lessonAvailable={false} onNext={onNext} /></ThemeProvider>);
  expect(screen.queryByText(question.explanation)).toBeNull();
  expect(screen.getByRole('button', { name: 'Keep records' })).not.toBeDisabled();
});
