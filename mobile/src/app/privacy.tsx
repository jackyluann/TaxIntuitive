import { AppIcon } from '@/components/AppIcon';
import React from 'react';
import { Linking, Text } from 'react-native';
import { contact } from '@/content';
import { Card, Screen, SectionTitle, TIText } from '@/components/ui';
import { useTheme } from '@/theme';

/**
 * Plain-language privacy policy.
 *
 * NOTE FOR JACKY: this is a starting draft written to match what the app actually does.
 * Have it reviewed before shipping to the App Store / Play Store, and fill in the
 * "last updated" date when you publish.
 */
export default function PrivacyScreen() {
  const t = useTheme();
  return (
    <Screen>
      <Card style={{ gap: t.space.sm }}>
        <AppIcon size={36} name="lock-closed-outline" />
        <TIText variant="h2">Privacy Policy</TIText>
        <TIText variant="caption" tone="muted">
          Draft · last updated 20 September 2026
        </TIText>
        <TIText variant="small">
          TaxIntuitive is built for young people learning about money. We collect as little as
          possible, and we never ask for the sensitive details a real tax filing would involve.
        </TIText>
      </Card>

      <SectionTitle>What we never collect</SectionTitle>
      <Card style={{ gap: 6 }}>
        {[
          'Social Insurance Numbers (SIN)',
          'Tax slips (T4, T4A, T5, T2202) or tax returns',
          'Banking credentials or account numbers',
          'Credit card numbers',
          'Any other sensitive financial information',
        ].map((item) => (
          <TIText key={item} variant="small" tone="muted">
            • {item}
          </TIText>
        ))}
        <TIText variant="caption" tone="brand">
          The app has no field anywhere that asks for these. If something ever does, it is not us.
        </TIText>
      </Card>

      <SectionTitle>Using the app as a guest</SectionTitle>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="small">
          You can use almost the entire app without an account. As a guest, your progress — lessons
          read, quiz scores, XP, simulator runs — is stored only on your own device. We cannot see it.
        </TIText>
      </Card>

      <SectionTitle>If you create an account</SectionTitle>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="small">We store only what makes the account work:</TIText>
        <TIText variant="small" tone="muted">
          • Your email address (or the private relay address Apple/Google gives us)
        </TIText>
        <TIText variant="small" tone="muted">
          • A display name you choose, so a Quiz Duo opponent knows who they are playing
        </TIText>
        <TIText variant="small" tone="muted">
          • Your learning progress: XP, lessons, quiz attempts, video positions, simulator runs
        </TIText>
        <TIText variant="small" tone="muted">
          • Quiz Duo match results
        </TIText>
        <TIText variant="small">
          Your rows are protected by database row-level security, which means your data is readable
          only by you — and, for a Quiz Duo match, the one opponent in that match.
        </TIText>
      </Card>

      <SectionTitle>Leaderboards</SectionTitle>
      <Card>
        <TIText variant="small" tone="muted">
          Your name only appears to other people if you turn on the leaderboard option. It is off by
          default.
        </TIText>
      </Card>

      <SectionTitle>Deleting your data</SectionTitle>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="small" tone="muted">
          You can reset on-device progress at any time in Settings. If you have an account, Settings →
          Delete my account permanently removes the account and everything stored with it.
        </TIText>
      </Card>

      <SectionTitle>Third parties</SectionTitle>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="small" tone="muted">
          We use Supabase to store accounts and progress. Videos are hosted on YouTube, so watching
          one means YouTube&apos;s own privacy policy applies. We do not sell your data or use
          advertising trackers.
        </TIText>
      </Card>

      <SectionTitle>Contact</SectionTitle>
      <Card>
        <Text
          accessibilityRole="link"
          onPress={() => void Linking.openURL(`mailto:${contact.email}`)}
          style={{ color: t.colors.brandDark, fontWeight: '700' }}
        >
          {contact.email}
        </Text>
      </Card>
    </Screen>
  );
}
