import { AppIcon } from '@/components/AppIcon';
import React from 'react';
import { Text, View } from 'react-native';
import { Card, ProgressBar, Screen, SectionTitle, TIText } from '@/components/ui';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';

export default function AchievementsScreen() {
  const t = useTheme();
  const { achievements } = useProgress();

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);
  const tierColor = (tier: 'bronze' | 'silver' | 'gold') =>
    tier === 'gold' ? t.colors.gold : tier === 'silver' ? t.colors.silver : t.colors.bronze;

  return (
    <Screen>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="h2">
          {earned.length} of {achievements.length} badges
        </TIText>
        <ProgressBar value={earned.length / Math.max(1, achievements.length)} />
        <TIText variant="caption" tone="muted">
          Badges unlock from real activity — lessons finished, quizzes passed, streaks kept.
        </TIText>
      </Card>

      {earned.length ? (
        <>
          <SectionTitle>Earned</SectionTitle>
          {earned.map(({ def }) => (
            <Card key={def.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
                <AppIcon size={30} name={def.emoji} />
                <View style={{ flex: 1 }}>
                  <TIText variant="bodyStrong">{def.title}</TIText>
                  <TIText variant="caption" tone="muted">
                    {def.description}
                  </TIText>
                </View>
                <View
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: t.radius.pill,
                    backgroundColor: tierColor(def.tier),
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                    {def.tier.toUpperCase()}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </>
      ) : null}

      <SectionTitle>{earned.length ? 'Still to unlock' : 'Badges to unlock'}</SectionTitle>
      {locked.map(({ def, progress }) => (
        <Card key={def.id} style={{ opacity: 0.85 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
            <AppIcon size={30} name={def.emoji} />
            <View style={{ flex: 1, gap: 6 }}>
              <TIText variant="bodyStrong">{def.title}</TIText>
              <TIText variant="caption" tone="muted">
                {def.description}
              </TIText>
              {progress > 0 ? (
                <>
                  <ProgressBar value={progress} height={6} color={tierColor(def.tier)} />
                  <TIText variant="caption" tone="muted">
                    {Math.round(progress * 100)}% there
                  </TIText>
                </>
              ) : null}
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
