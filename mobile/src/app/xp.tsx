import { AppIcon } from '@/components/AppIcon';
import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, ProgressBar, ScoreRing, Screen, SectionTitle, StatTile, TIText, Button } from '@/components/ui';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useAuth } from '@/providers/auth';
import { useTheme } from '@/theme';

/** Every number here is derived from real activity — see src/lib/xp/engine.ts. */
export default function XpScreen() {
  const t = useTheme();
  const router = useRouter();
  const { content } = useContent();
  const { stats, achievements } = useProgress();
  const { isGuest } = useAuth();

  const earned = achievements.filter((a) => a.earned);
  const trackColor = (id: string) =>
    ({
      taxes: t.colors.taxes,
      banking: t.colors.banking,
      credit: t.colors.credit,
      saving: t.colors.saving,
      investing: t.colors.investing,
    })[id] ?? t.colors.brand;

  return (
    <Screen>
      <Card style={{ alignItems: 'center', gap: t.space.md }}>
        <ScoreRing value={stats.literacyScore} label="Learning progress" />
        <View style={{ alignItems: 'center' }}>
          <TIText variant="h2">
            Level {stats.level} · {stats.levelTitle}
          </TIText>
          <TIText variant="small" tone="muted">
            {stats.totalXp.toLocaleString('en-CA')} XP earned
          </TIText>
        </View>
        <View style={{ width: '100%', gap: 6 }}>
          <ProgressBar
            value={stats.xpForNextLevel === null ? 1 : stats.xpIntoLevel / stats.xpForNextLevel}
          />
          <TIText variant="caption" tone="muted" center>
            {stats.xpForNextLevel === null
              ? 'Highest level reached'
              : `${stats.xpForNextLevel - stats.xpIntoLevel} XP to level ${stats.level + 1}`}
          </TIText>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: t.space.md }}>
        <StatTile label="Lessons" value={`${stats.lessonsCompleted}/${stats.lessonsAvailable}`} />
        <StatTile label="Quizzes" value={`${stats.quizzesPassed}`} tone="accent" />
        <StatTile label="Streak" value={`${stats.streakDays}d`} tone="ink" />
      </View>
      <View style={{ flexDirection: 'row', gap: t.space.md }}>
        <StatTile
          label="Accuracy"
          value={stats.quizAccuracy === null ? '—' : `${Math.round(stats.quizAccuracy * 100)}%`}
        />
        <StatTile label="Videos" value={`${stats.videosWatched}`} tone="accent" />
        <StatTile
          label="Simulator"
          value={stats.bestSimulatorTier ? titleCase(stats.bestSimulatorTier) : '—'}
          tone="ink"
        />
      </View>

      <SectionTitle>Progress by track</SectionTitle>
      {stats.tracks.map((track) => {
        const meta = content.tracks.find((x) => x.id === track.trackId);
        return (
          <Card key={track.trackId} style={{ gap: t.space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.sm }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  backgroundColor: trackColor(track.trackId),
                }}
              />
              <TIText variant="bodyStrong" style={{ flex: 1 }}>
                {meta?.title ?? track.trackId}
              </TIText>
              <TIText variant="caption" tone="muted">
                {track.xp} / {track.available} XP
              </TIText>
            </View>
            <ProgressBar value={track.ratio} color={trackColor(track.trackId)} height={7} />
          </Card>
        );
      })}

      <SectionTitle>Quiz Duo record</SectionTitle>
      <Card>
        {isGuest ? (
          <View style={{ gap: t.space.sm }}>
            <TIText variant="small" tone="muted">
              Quiz Duo results are saved to your account. Create one to track wins.
            </TIText>
            <Button label="Create an account" variant="outline" onPress={() => router.push('/auth/sign-up')} />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: t.space.md }}>
            <StatTile label="Wins" value={`${stats.duoWins}`} />
            <StatTile label="Badges" value={`${earned.length}`} tone="accent" />
          </View>
        )}
      </Card>

      <SectionTitle>Achievements</SectionTitle>
      <Card onPress={() => router.push('/achievements')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
          <AppIcon size={26} name="trophy-outline" />
          <View style={{ flex: 1 }}>
            <TIText variant="bodyStrong">
              {earned.length} of {achievements.length} earned
            </TIText>
            <TIText variant="caption" tone="muted">
              See every badge and what unlocks it
            </TIText>
          </View>
          <Text style={{ color: t.colors.muted, fontSize: 20 }}>›</Text>
        </View>
      </Card>
    </Screen>
  );
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
