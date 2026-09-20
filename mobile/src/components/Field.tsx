import React from 'react';
import { TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useTheme } from '@/theme';
import { TIText } from './ui';

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize = 'sentences',
  secureTextEntry,
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  secureTextEntry?: boolean;
  error?: string;
  autoComplete?: 'email' | 'password' | 'new-password' | 'name' | 'off';
}) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <TIText variant="caption" tone="muted">
        {label}
      </TIText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.colors.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        autoComplete={autoComplete}
        accessibilityLabel={label}
        style={{
          backgroundColor: t.colors.card,
          borderRadius: t.radius.lg,
          borderWidth: 1,
          borderColor: error ? t.colors.danger : t.colors.line,
          paddingHorizontal: t.space.lg,
          paddingVertical: 14,
          fontSize: 15,
          color: t.colors.ink,
          minHeight: multiline ? 110 : 48,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {error ? (
        <TIText variant="caption" tone="danger">
          {error}
        </TIText>
      ) : null}
    </View>
  );
}
