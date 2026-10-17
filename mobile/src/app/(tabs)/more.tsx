import React from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/auth';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';
import { Button, Card, Divider, ListRow, Screen, SectionTitle, TIText } from '@/components/ui';

export default function MoreScreen() {
  const t = useTheme();
  const router = useRouter();
  const { isGuest, displayName, signOut, authAvailable } = useAuth();
  const { stats, hasGuestDataToMerge, mergeGuestIntoAccount } = useProgress();

  return (
    <Screen>
      <Card padded={false}>
        <View style={{ padding: t.space.lg, gap: 4 }}>
          <TIText variant="h3">{isGuest ? 'Guest' : (displayName ?? 'Your account')}</TIText>
          <TIText variant="small" tone="muted">
            {isGuest
              ? 'Progress is saved on this device. An account adds Quiz Duo and syncing.'
              : 'Signed in · progress syncs across your devices.'}
          </TIText>
          <TIText variant="caption" tone="brand">
            Level {stats.level} · {stats.totalXp.toLocaleString('en-CA')} XP
          </TIText>
        </View>
        <Divider />
        <View style={{ padding: t.space.lg }}>
          {isGuest ? (
            <View style={{ gap: t.space.sm }}>
              <Button
                label="Create an account"
                onPress={() => router.push('/auth/sign-up')}
                disabled={!authAvailable}
              />
              <Button
                label="Sign in"
                variant="outline"
                onPress={() => router.push('/auth/sign-in')}
                disabled={!authAvailable}
              />
              {!authAvailable ? (
                <TIText variant="caption" tone="muted">
                  Accounts are not available yet. You can keep learning as a guest.
                </TIText>
              ) : null}
            </View>
          ) : (
            <View style={{ gap: t.space.sm }}>
              {hasGuestDataToMerge ? (
                <Button
                  label="Merge guest progress into this account"
                  variant="accent"
                  onPress={() => {
                    Alert.alert(
                      'Merge progress?',
                      'This copies the lessons, quizzes and XP you earned as a guest into your account.',
                      [
                        { text: 'Not now', style: 'cancel' },
                        { text: 'Merge', onPress: () => void mergeGuestIntoAccount() },
                      ],
                    );
                  }}
                />
              ) : null}
              <Button label="Sign out" variant="outline" onPress={() => void signOut()} />
            </View>
          )}
        </View>
      </Card>

      <SectionTitle>Explore</SectionTitle>
      <Card padded={false}>
        <ListRow icon="play-circle-outline" title="Expert videos" onPress={() => router.push('/videos')} />
        <Divider />
        <ListRow
          icon="game-controller-outline"
          title="Tax Simulator"
          subtitle="Survive your first year"
          onPress={() => router.push('/simulator')}
        />
        <Divider />
        <ListRow
          icon="ribbon-outline"
          title="XP Tracker"
          subtitle="Progress by track"
          onPress={() => router.push('/xp')}
        />
        <Divider />
        <ListRow
          icon="trophy-outline"
          title="Achievements"
          subtitle="Badges you've earned"
          onPress={() => router.push('/achievements')}
        />
        <Divider />
        <ListRow
          icon="people-outline"
          title="Quiz Duo"
          subtitle="Play against a friend"
          onPress={() => router.push('/duo')}
        />
        <Divider />
        <ListRow
          icon="book-outline"
          title="Tax Glossary"
          onPress={() => router.push('/glossary')}
        />
      </Card>

      <SectionTitle>TaxIntuitive</SectionTitle>
      <Card padded={false}>
        <ListRow icon="school-outline" title="Workshops" onPress={() => router.push('/workshops')} />
        <Divider />
        <ListRow icon="chatbubble-outline" title="About & contact" onPress={() => router.push('/about')} />
        <Divider />
        <ListRow icon="help-circle-outline" title="FAQ" onPress={() => router.push('/faq')} />
      </Card>

      <SectionTitle>Settings & legal</SectionTitle>
      <Card padded={false}>
        <ListRow icon="settings-outline" title="Settings" onPress={() => router.push('/settings')} />
        <Divider />
        <ListRow icon="lock-closed-outline" title="Privacy Policy" onPress={() => router.push('/privacy')} />
        <Divider />
        <ListRow
          icon="warning-outline"
          title="Educational Disclaimer"
          onPress={() => router.push('/disclaimer')}
        />
      </Card>

      <TIText variant="caption" tone="muted" center>
        TaxIntuitive · Vancouver, BC
      </TIText>
    </Screen>
  );
}
