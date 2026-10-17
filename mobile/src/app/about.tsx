import { AppIcon } from '@/components/AppIcon';
import React, { useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import { contact, DISCLAIMER } from '@/content';
import { Button, Card, DisclaimerNote, Pill, Screen, SectionTitle, TIText } from '@/components/ui';
import { Field } from '@/components/Field';
import { isValidEmail, submitContactMessage } from '@/lib/forms/submit';
import { useAuth } from '@/providers/auth';
import { useTheme } from '@/theme';

/** Founder story and mission, migrated from the website's About page. */
export default function AboutScreen() {
  const t = useTheme();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const send = async () => {
    const next: Record<string, string> = {};
    if (!isValidEmail(email)) next.email = 'Enter a valid email address.';
    if (message.trim().length < 10) next.message = 'Tell us a bit more (at least 10 characters).';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    const result = await submitContactMessage(
      { contactEmail: email.trim(), subject: 'TaxIntuitive app question', message: message.trim() },
      user?.id,
    );
    setSending(false);

    if (result.ok) {
      setEmail('');
      setMessage('');
      Alert.alert('Message sent', "Thanks! Your question might even become the next video.");
      return;
    }
    Alert.alert('Send by email instead?', 'We can open an email for you.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open email', onPress: () => void Linking.openURL(result.fallbackMailto) },
    ]);
  };

  return (
    <Screen>
      <Card style={{ backgroundColor: t.colors.brandDark, borderColor: t.colors.brandDark, gap: t.space.sm }}>
        <Text style={{ ...t.type.overline, color: t.colors.onBrand, opacity: 0.9 }}>ABOUT US</Text>
        <Text style={{ fontSize: 24, fontWeight: '800', color: t.colors.onBrand, letterSpacing: -0.5 }}>
          Making taxes make sense for the next generation.
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 22, color: t.colors.onBrand, opacity: 0.95 }}>
          Our mission is to demystify taxes for young people. Through trivia, expert-led videos, and
          plain-language guidance, we help you file with confidence and grow into a financially
          responsible adult.
        </Text>
      </Card>

      <SectionTitle>Meet the founder</SectionTitle>
      <Card style={{ gap: t.space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.lg }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: t.colors.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: '800', color: t.colors.onBrand }}>JL</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <TIText variant="h3">Jacky Luan</TIText>
            <TIText variant="caption" tone="brand">
              Founder, TaxIntuitive · Budding entrepreneur
            </TIText>
            <TIText variant="caption" tone="muted">
              Grade 11 student · Vancouver, British Columbia 🇨🇦
            </TIText>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm }}>
          <Pill label="Financial literacy" />
          <Pill label="Youth education" />
          <Pill label="Entrepreneurship" />
        </View>

        <TIText variant="small">
          I started TaxIntuitive because I want the next generation of adults to be genuinely
          prepared for the real world. So much of growing up, from earning a paycheque to filing
          taxes to managing money, gets handed to us with almost no instructions.
        </TIText>
        <TIText variant="small">
          It really began with a conversation with my dad, who&apos;s a tax specialist. He walked me
          through the problems and gaps he sees every day: people who don&apos;t understand their pay
          stubs, miss out on benefits, or feel lost at tax time simply because no one ever taught
          them. That conversation stuck with me, and TaxIntuitive is my answer to it.
        </TIText>
        <TIText variant="small">
          The goal is simple: no one should feel lost at their first paycheque or their first tax
          return.
        </TIText>
      </Card>

      <SectionTitle>What we&apos;re building</SectionTitle>
      <Card style={{ gap: t.space.md }}>
        {[
          ['bulb-outline', 'Trivia & quizzes', 'Test your tax smarts with instant, plain-language explanations.'],
          ['videocam-outline', 'Expert videos', 'Real questions answered by a tax expert, no textbook.'],
          ['game-controller-outline', 'Simulator', 'Survive your first year after high school, one money decision at a time.'],
          ['library-outline', 'Guides & lessons', 'Short, jargon-free lessons on how taxes really work.'],
        ].map(([icon, title, body]) => (
          <View key={title} style={{ flexDirection: 'row', gap: t.space.md }}>
            <AppIcon size={22} name={icon} />
            <View style={{ flex: 1 }}>
              <TIText variant="bodyStrong">{title}</TIText>
              <TIText variant="caption" tone="muted">
                {body}
              </TIText>
            </View>
          </View>
        ))}
      </Card>

      <SectionTitle>Accounts are optional</SectionTitle>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="small">
          You can read every lesson, watch every video, take every solo quiz, use the simulator and
          earn XP without making an account — your progress is saved on your device.
        </TIText>
        <TIText variant="small" tone="muted">
          An account is only needed for Quiz Duo, inviting friends, leaderboards, and syncing your
          progress across devices.
        </TIText>
      </Card>

      <SectionTitle>Get in touch</SectionTitle>
      <Card style={{ gap: t.space.md }}>
        <TIText variant="small" tone="muted">
          Questions, ideas, or want to collaborate on a workshop? Send us a message — your question
          might become the next expert video.
        </TIText>
        <Field
          label="Your email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />
        <Field
          label="Your message"
          value={message}
          onChangeText={setMessage}
          placeholder="I have a question about…"
          multiline
          error={errors.message}
        />
        <Button label="Send message" onPress={() => void send()} loading={sending} fullWidth />
        <Text
          accessibilityRole="link"
          onPress={() => void Linking.openURL(`mailto:${contact.email}`)}
          style={{ color: t.colors.brandDark, fontWeight: '700', textAlign: 'center' }}
        >
          {contact.email}
        </Text>
        <Text
          accessibilityRole="link"
          onPress={() => void Linking.openURL(contact.siteUrl)}
          style={{ color: t.colors.muted, textAlign: 'center', fontSize: 13 }}
        >
          taxintuitive.com ↗
        </Text>
      </Card>

      <DisclaimerNote text={DISCLAIMER} />
      <TIText variant="caption" tone="muted" center>
        TaxIntuitive · {contact.location} · Demystifying wealth
      </TIText>
    </Screen>
  );
}
