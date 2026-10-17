import { Alert } from '@/lib/alert';
import React, { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import * as Calendar from 'expo-calendar';
import { contact } from '@/content';
import { Button, Card, EmptyState, Pill, Screen, SectionTitle, TIText } from '@/components/ui';
import { Field } from '@/components/Field';
import { isValidEmail, submitWorkshopRequest } from '@/lib/forms/submit';
import { useAuth } from '@/providers/auth';
import { useContent } from '@/providers/content';
import { useTheme } from '@/theme';

export default function WorkshopsScreen() {
  const t = useTheme();
  const { content } = useContent();
  const { user } = useAuth();

  const upcoming = content.workshops
    .filter((w) => w.status === 'upcoming')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const addToCalendar = async (title: string, startsAt: string, endsAt?: string, location?: string) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Calendar access needed', 'Allow calendar access to add this workshop.');
        return;
      }
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const target =
        calendars.find((c) => c.allowsModifications && c.source?.name !== 'Other') ??
        calendars.find((c) => c.allowsModifications);
      if (!target) {
        Alert.alert('No calendar available', 'No editable calendar was found on this device.');
        return;
      }
      const start = new Date(startsAt);
      const end = endsAt ? new Date(endsAt) : new Date(start.getTime() + 60 * 60 * 1000);
      await Calendar.createEventAsync(target.id, {
        title,
        startDate: start,
        endDate: end,
        location,
        notes: 'TaxIntuitive workshop',
      });
      Alert.alert('Added', 'The workshop is now in your calendar.');
    } catch {
      Alert.alert('Could not add event', 'Something went wrong adding this to your calendar.');
    }
  };

  const send = async () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Please add your name.';
    if (!isValidEmail(email)) next.email = 'Enter a valid email address.';
    if (message.trim().length < 10) next.message = 'Tell us a bit more (at least 10 characters).';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    const result = await submitWorkshopRequest(
      {
        contactName: name.trim(),
        contactEmail: email.trim(),
        organization: org.trim() || undefined,
        message: message.trim(),
      },
      user?.id,
    );
    setSending(false);

    if (result.ok) {
      setName('');
      setEmail('');
      setOrg('');
      setMessage('');
      Alert.alert('Request sent', "Thanks! We'll be in touch by email.");
      return;
    }
    Alert.alert(
      'Send by email instead?',
      result.reason === 'unconfigured'
        ? 'Online requests are not set up yet, but we can open an email for you.'
        : 'That did not go through. We can open an email instead.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open email', onPress: () => void Linking.openURL(result.fallbackMailto) },
      ],
    );
  };

  return (
    <Screen>
      <Card style={{ gap: t.space.sm }}>
        <TIText variant="h2">Workshops</TIText>
        <TIText variant="small" tone="muted">
          TaxIntuitive runs plain-language sessions for classes, clubs and youth groups — how
          paycheques work, how to file a first return, and how to stop being scared of tax season.
        </TIText>
      </Card>

      <SectionTitle>Upcoming</SectionTitle>
      {upcoming.length === 0 ? (
        <EmptyState
          icon="school-outline"
          title="No workshops scheduled yet"
          body="New sessions are being planned. Request one for your school or organization below and you'll be first to know."
        />
      ) : (
        upcoming.map((w) => (
          <Card key={w.id} style={{ gap: t.space.sm }}>
            <View style={{ flexDirection: 'row', gap: t.space.sm, flexWrap: 'wrap' }}>
              <Pill label={w.online ? 'Online' : 'In person'} />
              {w.audience ? <Pill label={w.audience} tone="muted" /> : null}
            </View>
            <TIText variant="h3">{w.title}</TIText>
            <TIText variant="small" tone="muted">
              {w.description}
            </TIText>
            <TIText variant="caption" tone="brand">
              {formatWhen(w.startsAt)}
              {w.locationName ? ` · ${w.locationName}` : ''}
            </TIText>
            <View style={{ flexDirection: 'row', gap: t.space.sm, flexWrap: 'wrap' }}>
              {w.registrationUrl ? (
                <Button
                  label="Register"
                  onPress={() => void Linking.openURL(w.registrationUrl!)}
                  style={{ flexGrow: 1 }}
                />
              ) : null}
              <Button
                label="Add to calendar"
                variant="outline"
                onPress={() => void addToCalendar(w.title, w.startsAt, w.endsAt, w.address)}
                style={{ flexGrow: 1 }}
              />
              {w.address && !w.online ? (
                <Button
                  label="Directions"
                  variant="ghost"
                  onPress={() =>
                    void Linking.openURL(
                      `https://maps.apple.com/?q=${encodeURIComponent(w.address!)}`,
                    )
                  }
                  style={{ flexGrow: 1 }}
                />
              ) : null}
            </View>
          </Card>
        ))
      )}

      <SectionTitle>Request a workshop</SectionTitle>
      <Card style={{ gap: t.space.md }}>
        <TIText variant="small" tone="muted">
          Teacher, counsellor or student leader? Tell us about your group and we&apos;ll get back to
          you.
        </TIText>
        <Field
          label="Your name"
          value={name}
          onChangeText={setName}
          placeholder="Alex Chen"
          autoCapitalize="words"
          autoComplete="name"
          error={errors.name}
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@school.ca"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />
        <Field
          label="School or organization (optional)"
          value={org}
          onChangeText={setOrg}
          placeholder="Vancouver Secondary School"
        />
        <Field
          label="What are you looking for?"
          value={message}
          onChangeText={setMessage}
          placeholder="Grade 11 careers class, ~30 students, sometime in the spring…"
          multiline
          error={errors.message}
        />
        <Button label="Send request" onPress={() => void send()} loading={sending} fullWidth />
      </Card>

      <Card style={{ gap: 4 }}>
        <TIText variant="bodyStrong">Prefer email?</TIText>
        <Text
          accessibilityRole="link"
          onPress={() => void Linking.openURL(`mailto:${contact.email}`)}
          style={{ color: t.colors.brandDark, fontWeight: '700' }}
        >
          {contact.email}
        </Text>
        <TIText variant="caption" tone="muted">
          {contact.location}
        </TIText>
      </Card>
    </Screen>
  );
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-CA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
