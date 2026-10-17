import { Alert } from '@/lib/alert';
import { AppIcon } from '@/components/AppIcon';
import React, { useState } from 'react';
import { Share, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Button, Card, Pill, Screen, SectionTitle, StatTile, TIText } from '@/components/ui';
import { Field } from '@/components/Field';
import { createMatch, joinMatch } from '@/lib/duo/client';
import { useAuth } from '@/providers/auth';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';

/** Quiz Duo lobby: create a private match, or join one with a room code. */
export default function DuoLobbyScreen() {
  const t = useTheme();
  const router = useRouter();
  const { isGuest, displayName, authAvailable } = useAuth();
  const { stats, progress } = useProgress();

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<null | 'create' | 'join'>(null);
  const [created, setCreated] = useState<{ matchId: string; roomCode: string } | null>(null);

  /* ------------------------------------------------------------------ guest gate */
  if (isGuest) {
    return (
      <Screen>
        <Card style={{ gap: t.space.md, alignItems: 'center' }}>
          <AppIcon size={44} name="people-outline" />
          <TIText variant="h2" center>
            Quiz Duo needs an account
          </TIText>
          <TIText variant="small" tone="muted" center>
            Quiz Duo requires an account so we can connect you with another player, save match
            results, and keep scoring fair.
          </TIText>
          <TIText variant="caption" tone="muted" center>
            Everything else in TaxIntuitive — lessons, solo quizzes, videos, the simulator — keeps
            working without one.
          </TIText>
          <View style={{ width: '100%', gap: t.space.sm, marginTop: t.space.sm }}>
            <Button
              label="Create an account"
              onPress={() => router.push('/auth/sign-up')}
              disabled={!authAvailable}
              fullWidth
            />
            <Button
              label="Sign in"
              variant="outline"
              onPress={() => router.push('/auth/sign-in')}
              disabled={!authAvailable}
              fullWidth
            />
            {!authAvailable ? (
              <TIText variant="caption" tone="muted" center>
                Accounts need Supabase configured — see README → Setup.
              </TIText>
            ) : null}
          </View>
        </Card>
      </Screen>
    );
  }

  const host = async () => {
    setBusy('create');
    try {
      const result = await createMatch(displayName ?? undefined);
      setCreated({ matchId: result.matchId, roomCode: result.roomCode });
      router.push(`/duo/${result.matchId}`);
    } catch (e) {
      Alert.alert('Could not create match', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(null);
    }
  };

  const join = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      Alert.alert('Enter a room code', 'Ask your opponent for their 6-character code.');
      return;
    }
    setBusy('join');
    try {
      const result = await joinMatch(trimmed, displayName ?? undefined);
      router.push(`/duo/${result.matchId}`);
    } catch (e) {
      Alert.alert('Could not join', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="h2">Quiz Duo </TIText>
        <TIText variant="small" tone="muted">
          Two players, the same questions, live scoring. Answer fast — speed and streaks earn bonus
          points.
        </TIText>
      </Card>

      <View style={{ flexDirection: 'row', gap: t.space.md }}>
        <StatTile label="Wins" value={`${progress.duo.wins}`} />
        <StatTile label="Losses" value={`${progress.duo.losses}`} tone="ink" />
        <StatTile label="Ties" value={`${progress.duo.ties}`} tone="accent" />
      </View>

      <SectionTitle>Start a match</SectionTitle>
      <Card style={{ gap: t.space.md }}>
        <TIText variant="small" tone="muted">
          Create a private match and share the code with a friend.
        </TIText>
        <Button label="Create a match" onPress={() => void host()} loading={busy === 'create'} fullWidth />
        {created ? (
          <View style={{ gap: t.space.sm, alignItems: 'center' }}>
            <Pill label={`Room code: ${created.roomCode}`} />
            <View style={{ flexDirection: 'row', gap: t.space.sm }}>
              <Button
                label="Copy code"
                variant="ghost"
                onPress={() => void Clipboard.setStringAsync(created.roomCode)}
              />
              <Button
                label="Invite"
                variant="ghost"
                onPress={() =>
                  void Share.share({
                    message: `Play Quiz Duo with me on TaxIntuitive! Room code: ${created.roomCode}`,
                  })
                }
              />
            </View>
          </View>
        ) : null}
      </Card>

      <SectionTitle>Join a match</SectionTitle>
      <Card style={{ gap: t.space.md }}>
        <Field
          label="Room code"
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          placeholder="7KQ2ZD"
          autoCapitalize="none"
        />
        <Button label="Join match" variant="accent" onPress={() => void join()} loading={busy === 'join'} fullWidth />
      </Card>

      <Card style={{ gap: 4 }}>
        <TIText variant="caption" tone="muted">
          Quiz Duo needs an internet connection. Answers, timing and final scores are checked on the
          server, so a match is always scored fairly.
        </TIText>
        <TIText variant="caption" tone="muted">
          Your level: {stats.level} · {stats.levelTitle}
        </TIText>
      </Card>
    </Screen>
  );
}
