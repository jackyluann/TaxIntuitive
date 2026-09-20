import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Button, Card, Divider, Screen, TIText } from '@/components/ui';
import { Field } from '@/components/Field';
import { isValidEmail } from '@/lib/forms/submit';
import { useAuth } from '@/providers/auth';
import { useTheme } from '@/theme';

export default function SignInScreen() {
  const t = useTheme();
  const router = useRouter();
  const {
    signInWithEmail,
    signInWithApple,
    signInWithGoogle,
    sendPasswordReset,
    authAvailable,
    appleAvailable,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<null | 'email' | 'apple' | 'google' | 'reset'>(null);

  const run = async (kind: NonNullable<typeof busy>, fn: () => Promise<void>, done?: string) => {
    setBusy(kind);
    try {
      await fn();
      if (done) Alert.alert(done);
      else router.back();
    } catch (e) {
      Alert.alert('Sign-in failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(null);
    }
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (!isValidEmail(email)) next.email = 'Enter a valid email address.';
    if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;
    void run('email', () => signInWithEmail(email, password));
  };

  if (!authAvailable) {
    return (
      <Screen>
        <Card style={{ gap: t.space.sm }}>
          <TIText variant="h3">Accounts aren&apos;t set up yet</TIText>
          <TIText variant="small" tone="muted">
            This build has no Supabase configuration, so sign-in is unavailable. Everything else in
            the app works as a guest.
          </TIText>
          <TIText variant="caption" tone="muted">
            Developers: copy .env.example to .env and fill in EXPO_PUBLIC_SUPABASE_URL and
            EXPO_PUBLIC_SUPABASE_ANON_KEY.
          </TIText>
          <Button label="Continue as guest" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={{ gap: t.space.md }}>
        <TIText variant="h2">Welcome back</TIText>
        <TIText variant="small" tone="muted">
          Signing in syncs your progress across devices and unlocks Quiz Duo.
        </TIText>
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
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          error={errors.password}
        />
        <Button label="Sign in" onPress={submit} loading={busy === 'email'} fullWidth />
        <Button
          label="Forgot password?"
          variant="ghost"
          loading={busy === 'reset'}
          onPress={() => {
            if (!isValidEmail(email)) {
              setErrors({ email: 'Enter your email first, then tap reset.' });
              return;
            }
            void run('reset', () => sendPasswordReset(email), 'Check your email for a reset link.');
          }}
          fullWidth
        />
      </Card>

      <View style={{ gap: t.space.sm }}>
        <Divider />
        <TIText variant="caption" tone="muted" center>
          or continue with
        </TIText>
        {Platform.OS === 'ios' && appleAvailable ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
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
        <Button
          label="Continue with Google"
          variant="outline"
          loading={busy === 'google'}
          onPress={() => void run('google', signInWithGoogle)}
          fullWidth
        />
      </View>

      <Button
        label="New here? Create an account"
        variant="ghost"
        onPress={() => router.replace('/auth/sign-up')}
        fullWidth
      />
    </Screen>
  );
}
