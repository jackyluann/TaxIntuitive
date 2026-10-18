import { Alert } from '@/lib/alert';
import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Button, Card, Divider, Screen, TIText } from '@/components/ui';
import { Field } from '@/components/Field';
import { isValidEmail } from '@/lib/forms/submit';
import { useAuth } from '@/providers/auth';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';

export default function SignUpScreen() {
  const t = useTheme();
  const router = useRouter();
  const { signUpWithEmail, signInWithApple, signInWithGoogle, authAvailable, appleAvailable } =
    useAuth();
  const { stats } = useProgress();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<null | 'email' | 'apple' | 'google'>(null);

  const hasGuestProgress = stats.totalXp > 0;

  const run = async (kind: NonNullable<typeof busy>, fn: () => Promise<void>, done?: string) => {
    setBusy(kind);
    try {
      await fn();
      if (done) Alert.alert('Almost there', done);
      if (!done) router.replace('/');
    } catch (e) {
      Alert.alert('Could not create account', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    if (busy) return;
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Pick a display name (2+ characters).';
    if (!isValidEmail(email)) next.email = 'Enter a valid email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy('email');
    try {
      const { signedIn } = await signUpWithEmail(email, password, name);
      if (signedIn) {
        router.replace('/');
      } else {
        Alert.alert('Check your email', 'Confirm your email address, then sign in. If no message arrives, contact support before trying again.');
      }
    } catch (e) {
      Alert.alert('Could not create account', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  if (!authAvailable) {
    return (
      <Screen>
        <Card style={{ gap: t.space.sm }}>
          <TIText variant="h3">Accounts aren&apos;t set up yet</TIText>
          <TIText variant="small" tone="muted">
            This build has no Supabase configuration. You can still use everything except Quiz Duo
            and syncing.
          </TIText>
          <Button label="Continue as guest" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={{ gap: t.space.md }}>
        <TIText variant="h2">Create your account</TIText>
        <TIText variant="small" tone="muted">
          You only need an account for Quiz Duo, inviting friends, leaderboards, and syncing across
          devices. Everything else works as a guest.
        </TIText>
        {hasGuestProgress ? (
          <Card style={{ backgroundColor: t.colors.tipBg, borderColor: t.colors.tipLine }}>
            <TIText variant="caption" tone="brand">
              You&apos;ve earned {stats.totalXp} XP as a guest. After signing in you&apos;ll be asked
              whether to merge it into your new account.
            </TIText>
          </Card>
        ) : null}
        <TIText variant="small" tone="muted">Beta accounts use email and password. Email verification and password recovery are currently unavailable. Please save your password.</TIText>
        <Field
          label="Display name"
          value={name}
          onChangeText={setName}
          placeholder="Alex"
          autoCapitalize="words"
          autoComplete="name"
          error={errors.name}
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.password}
        />
        <Button label="Create account" disabled={busy !== null} onPress={submit} loading={busy === 'email'} fullWidth />
      </Card>

      {(process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED === 'true' || (Platform.OS === 'ios' && appleAvailable)) ? <View style={{ gap: t.space.sm }}>
        <Divider />
        <TIText variant="caption" tone="muted" center>
          or sign up with
        </TIText>
        {Platform.OS === 'ios' && appleAvailable ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={
              t.isDark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={999}
            style={{ height: 48 }}
            onPress={() => void run('apple', signInWithApple)}
          />
        ) : null}
        {process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED === 'true' ? <Button
          label="Continue with Google"
          variant="outline"
          loading={busy === 'google'}
          onPress={() => void run('google', signInWithGoogle)}
          fullWidth
        /> : null}
      </View> : null}

      <Button
        label="Already have an account? Sign in"
        variant="ghost"
        onPress={() => router.replace('/auth/sign-in')}
        fullWidth
      />
      <TIText variant="caption" tone="muted" center>
        We never ask for your SIN, tax slips, or banking details.
      </TIText>
    </Screen>
  );
}
