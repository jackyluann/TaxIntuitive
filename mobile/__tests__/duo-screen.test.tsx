import React from 'react';
import { Alert } from 'react-native';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import DuoMatchScreen from '@/app/duo/[matchId]';
import { ThemeProvider } from '@/theme';
import {
  advanceMatch,
  fetchAnswers,
  fetchMatch,
  fetchParticipants,
  submitAnswer,
} from '@/lib/duo/client';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ matchId: 'match' }),
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('@/providers/auth', () => ({
  useAuth: () => ({ user: { id: 'host' } }),
}));
jest.mock('@/providers/content', () => ({
  useContent: () => ({
    content: {
      questions: [
        {
          id: 'q',
          prompt: 'A question',
          options: ['Option A', 'Option B'],
          answerIndex: 0,
        },
      ],
    },
  }),
}));
jest.mock('@/providers/progress', () => ({
  useProgress: () => ({ recordDuoResult: jest.fn() }),
}));
jest.mock('@/components/AppIcon', () => ({ AppIcon: () => null }));
jest.mock('@/lib/duo/client', () => ({
  fetchMatch: jest.fn(),
  fetchParticipants: jest.fn(),
  fetchAnswers: jest.fn(),
  submitAnswer: jest.fn(),
  advanceMatch: jest.fn().mockResolvedValue({ advanced: false }),
  touchPresence: jest.fn().mockResolvedValue(undefined),
  subscribeToMatch: () => ({ unsubscribe: jest.fn() }),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest
    .mocked(fetchMatch)
    .mockResolvedValue({
      id: 'match',
      status: 'active',
      current_index: 0,
      question_ids: ['q'],
      question_started_at: new Date().toISOString(),
      seconds_per_question: 20,
    } as never);
  jest.mocked(fetchParticipants).mockResolvedValue([
    { user_id: 'host', score: 0 },
    { user_id: 'guest', score: 0 },
  ] as never);
  jest.mocked(fetchAnswers).mockResolvedValue([]);
});
afterEach(() => {
  cleanup();
  jest.useRealTimers();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

it('keeps asking the server to advance after we answered and the opponent disconnected', async () => {
  jest
    .mocked(fetchAnswers)
    .mockResolvedValue([
      { user_id: 'host', question_index: 0, chosen_index: 0 },
    ] as never);
  await render(
    <ThemeProvider>
      <DuoMatchScreen />
    </ThemeProvider>,
  );
  await act(async () => {
    await jest.advanceTimersByTimeAsync(25000);
  });
  expect(advanceMatch).toHaveBeenCalledWith('match', 0);
  expect(jest.mocked(advanceMatch).mock.calls.length).toBeGreaterThan(1);
});

it('lets the player retry after an unconfirmed submission', async () => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest
    .mocked(submitAnswer)
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce({
      isCorrect: true,
      correctIndex: 0,
      explanation: 'Correct.',
      awardedPoints: 100,
      timedOut: false,
    });
  await render(
    <ThemeProvider>
      <DuoMatchScreen />
    </ThemeProvider>,
  );
  await fireEvent.press(screen.getByText('Option A'));
  await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
  await fireEvent.press(screen.getByText('Option A'));
  await waitFor(() => expect(submitAnswer).toHaveBeenCalledTimes(2));
  expect(screen.getByText('Correct.')).toBeTruthy();
});
