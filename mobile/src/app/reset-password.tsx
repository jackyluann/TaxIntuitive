import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Screen, TIText } from '@/components/ui';
import { Field } from '@/components/Field';
import { useAuth } from '@/providers/auth';
import { requireSupabase } from '@/lib/supabase/client';

export default function ResetPasswordScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const submit = async () => {
    if (busy) return;
    if (password.length < 8 || password !== confirm) {
      setMessage('Use at least 8 characters and make sure both passwords match.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const { error } = await requireSupabase().auth.updateUser({ password });
      if (error) throw error;
      setSaved(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update password. Please retry.');
    } finally { setBusy(false); }
  };
  return <Screen><Card style={{ gap: 16 }}>
    <TIText variant="h2">Reset password</TIText>
    {loading ? <TIText>Checking your link…</TIText> : saved ? <>
      <TIText>Your password has been updated.</TIText>
      <Button label="Continue learning" onPress={() => router.replace('/')} />
    </> : !user ? <>
      <TIText>This link has expired or is invalid. Request a new reset link from the sign-in page.</TIText>
      <Button label="Go to sign in" onPress={() => router.replace('/auth/sign-in')} />
    </> : <>
      <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
      <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" />
      {message ? <View accessibilityRole="alert"><TIText>{message}</TIText></View> : null}
      <Button label="Save password" loading={busy} onPress={() => void submit()} />
    </>}
  </Card></Screen>;
}
