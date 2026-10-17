import { AppIcon } from '@/components/AppIcon';
import React from 'react';
import { Linking } from 'react-native';
import { CRA_URL, DISCLAIMER } from '@/content';
import { Button, Card, Screen, TIText } from '@/components/ui';
import { useTheme } from '@/theme';

export default function DisclaimerScreen() {
  const t = useTheme();
  return (
    <Screen>
      <Card style={{ gap: t.space.md }}>
        <AppIcon size={40} name="warning-outline" />
        <TIText variant="h2">Educational Disclaimer</TIText>
        <TIText variant="body">{DISCLAIMER}</TIText>
      </Card>

      <Card style={{ gap: t.space.sm }}>
        <TIText variant="bodyStrong">What this means in practice</TIText>
        <TIText variant="small" tone="muted">
          • Everything here is written to help you understand how taxes work, not to tell you what to
          do in your own situation.
        </TIText>
        <TIText variant="small" tone="muted">
          • Deadlines, penalties, benefit amounts, contribution limits and eligibility rules change.
          Each lesson shows when it was last reviewed and links to its official source.
        </TIText>
        <TIText variant="small" tone="muted">
          • The simulator uses simplified numbers to teach ideas. It is not a tax calculator and does
          not estimate what you owe.
        </TIText>
        <TIText variant="small" tone="muted">
          • For your specific situation, talk to a qualified tax professional.
        </TIText>
      </Card>

      <Button
        label="Open canada.ca (CRA)"
        variant="outline"
        onPress={() => void Linking.openURL(CRA_URL)}
        fullWidth
      />
    </Screen>
  );
}
