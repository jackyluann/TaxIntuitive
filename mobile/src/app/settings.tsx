import React, { useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { CONTENT_VERSION } from '@/content';
import { Button, Card, Divider, ListRow, Screen, SectionTitle, TIText } from '@/components/ui';
import { useAuth } from '@/providers/auth';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';

export default function SettingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const { isGuest, displayName, signOut, deleteAccount, authAvailable } = useAuth();
  const { content, refresh, refreshing, source } = useContent();
  const { resetProgress, stats } = useProgress();
  const [busy, setBusy] = useState(false);

  const confirmReset = () => {
    Alert.alert(
      'Reset progress?',
      'This erases your XP, completed lessons, quiz history and simulator runs on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => void resetProgress(),
        },
      ],
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and all progress stored in the cloud. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await deleteAccount();
              Alert.alert('Account deleted', 'Your account and cloud data have been removed.');
            } catch (e) {
              Alert.alert('Could not delete', e instanceof Error ? e.message : 'Unknown error');
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <SectionTitle>Account</SectionTitle>
      <Card padded={false}>
        <View style={{ padding: t.space.lg, gap: 4 }}>
          <TIText variant="bodyStrong">{isGuest ? 'Guest' : (displayName ?? 'Signed in')}</TIText>
          <TIText variant="caption" tone="muted">
            {isGuest
              ? 'Progress is stored on this device only.'
              : 'Progress syncs to your account.'}
          </TIText>
        </View>
        <Divider />
        <View style={{ padding: t.space.lg, gap: t.space.sm }}>
          {isGuest ? (
            <>
              <Button
                label="Sign in"
                variant="outline"
                onPress={() => router.push('/auth/sign-in')}
                disabled={!authAvailable}
              />
              <Button
                label="Create account"
                onPress={() => router.push('/auth/sign-up')}
                disabled={!authAvailable}
              />
            </>
          ) : (
            <Button label="Sign out" variant="outline" onPress={() => void signOut()} />
          )}
        </View>
      </Card>

      <SectionTitle>Appearance</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <TIText variant="bodyStrong">Follow device theme</TIText>
            <TIText variant="caption" tone="muted">
              TaxIntuitive matches your system light/dark setting.
            </TIText>
          </View>
          <Switch value disabled accessibilityLabel="Follow device theme (always on)" />
        </View>
      </Card>

      <SectionTitle>Content</SectionTitle>
      <Card style={{ gap: t.space.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TIText variant="caption" tone="muted">
            Source
          </TIText>
          <TIText variant="caption">
            {source === 'remote' ? 'Supabase' : source === 'cache' ? 'Cached' : 'Bundled (offline)'}
          </TIText>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TIText variant="caption" tone="muted">
            Lessons / quizzes / videos
          </TIText>
          <TIText variant="caption">
            {content.lessons.length} / {content.questions.length} / {content.videos.length}
          </TIText>
        </View>
        <Button
          label="Check for content updates"
          variant="ghost"
          onPress={() => void refresh()}
          loading={refreshing}
        />
      </Card>

      <SectionTitle>Your data</SectionTitle>
      <Card padded={false}>
        <ListRow
          icon="stats-chart-outline"
          title="Reset progress on this device"
          subtitle={`${stats.totalXp} XP · ${stats.lessonsCompleted} lessons`}
          onPress={confirmReset}
          right={null}
        />
        {!isGuest ? (
          <>
            <Divider />
            <ListRow
              icon="trash-outline"
              title="Delete my account"
              subtitle="Removes your account and cloud data"
              onPress={confirmDelete}
              right={null}
            />
          </>
        ) : null}
      </Card>
      {busy ? (
        <TIText variant="caption" tone="muted" center>
          Working…
        </TIText>
      ) : null}

      <SectionTitle>Legal</SectionTitle>
      <Card padded={false}>
        <ListRow icon="lock-closed-outline" title="Privacy Policy" onPress={() => router.push('/privacy')} />
        <Divider />
        <ListRow
          icon="warning-outline"
          title="Educational Disclaimer"
          onPress={() => router.push('/disclaimer')}
        />
      </Card>

      <TIText variant="caption" tone="muted" center>
        TaxIntuitive v{Constants.expoConfig?.version ?? '1.0.0'} · content v{CONTENT_VERSION}
      </TIText>
    </Screen>
  );
}
