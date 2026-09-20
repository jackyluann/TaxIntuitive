import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type RefreshControlProps,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

/* -------------------------------------------------------------------------- text */

type TextTone = 'ink' | 'muted' | 'brand' | 'onBrand' | 'danger' | 'success' | 'accent';
type TextVariant = keyof ReturnType<typeof useTheme>['type'];

export function TIText({
  children,
  variant = 'body',
  tone = 'ink',
  style,
  numberOfLines,
  center,
}: {
  children: React.ReactNode;
  variant?: TextVariant;
  tone?: TextTone;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  center?: boolean;
}) {
  const t = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        t.type[variant] as TextStyle,
        { color: t.colors[tone] },
        center && { textAlign: 'center' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------------ screen */

export function Screen({
  children,
  scroll = true,
  contentStyle,
  refreshControl,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  const t = useTheme();
  const body = (
    <View style={[{ padding: t.space.lg, gap: t.space.lg }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: t.space.xxxl }}
          keyboardDismissMode="on-drag"
          refreshControl={refreshControl}
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- card */

export function Card({
  children,
  onPress,
  style,
  padded = true,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  const base: ViewStyle = {
    backgroundColor: t.colors.card,
    borderRadius: t.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.colors.line,
    padding: padded ? t.space.lg : 0,
    ...t.shadow,
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, pressed && { opacity: 0.85 }, style]}
    >
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------------ button */

export type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'outline' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  fullWidth,
  accessibilityHint,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  accessibilityHint?: string;
}) {
  const t = useTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: t.colors.brand, fg: t.colors.onBrand },
    accent: { bg: t.colors.accent, fg: t.colors.onAccent },
    ghost: { bg: t.colors.tipBg, fg: t.colors.brandDark },
    outline: { bg: 'transparent', fg: t.colors.brandDark, border: t.colors.brand },
    danger: { bg: t.colors.dangerBg, fg: t.colors.danger },
  };
  const p = palette[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(inactive), busy: Boolean(loading) }}
      accessibilityHint={accessibilityHint}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: p.bg,
          borderRadius: t.radius.pill,
          borderWidth: p.border ? 1.5 : 0,
          borderColor: p.border,
          paddingVertical: 14,
          paddingHorizontal: t.space.xl,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
          opacity: inactive ? 0.5 : pressed ? 0.88 : 1,
          alignSelf: fullWidth ? 'stretch' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <Text style={{ color: p.fg, fontSize: 15, fontWeight: '800' }}>{label}</Text>
      )}
    </Pressable>
  );
}

/* --------------------------------------------------------------------- pill/badge */

export function Pill({
  label,
  tone = 'brand',
  style,
}: {
  label: string;
  tone?: 'brand' | 'accent' | 'muted' | 'success' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const map = {
    brand: { bg: t.colors.tipBg, fg: t.colors.brandDark },
    accent: { bg: t.colors.warningBg, fg: t.colors.warningInk },
    muted: { bg: t.colors.subtle, fg: t.colors.muted },
    success: { bg: t.colors.successBg, fg: t.colors.success },
    danger: { bg: t.colors.dangerBg, fg: t.colors.danger },
  }[tone];

  return (
    <View
      style={[
        {
          backgroundColor: map.bg,
          borderRadius: t.radius.pill,
          paddingVertical: 5,
          paddingHorizontal: t.space.md,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ color: map.fg, fontSize: 12, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

/* ---------------------------------------------------------------------- progress */

export function ProgressBar({
  value,
  color,
  height = 8,
}: {
  /** 0-1 */
  value: number;
  color?: string;
  height?: number;
}) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{
        height,
        backgroundColor: t.isDark ? t.colors.subtle : '#E6F2EC',
        borderRadius: t.radius.pill,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          backgroundColor: color ?? t.colors.brand,
          borderRadius: t.radius.pill,
        }}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ section title */

export function SectionTitle({ children, action }: { children: string; action?: React.ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: t.space.sm,
      }}
    >
      <Text
        style={{
          ...t.type.overline,
          color: t.colors.muted,
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Text>
      {action}
    </View>
  );
}

/* ------------------------------------------------------------------------- stats */

export function StatTile({
  label,
  value,
  tone = 'brand',
  style,
}: {
  label: string;
  value: string;
  tone?: 'brand' | 'accent' | 'ink';
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const color =
    tone === 'brand' ? t.colors.brandDark : tone === 'accent' ? t.colors.accent : t.colors.ink;
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: t.colors.subtle,
          borderRadius: t.radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.colors.line,
          padding: t.space.md,
        },
        style,
      ]}
    >
      <Text style={{ ...t.type.overline, color: t.colors.muted }}>{label.toUpperCase()}</Text>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '800',
          color,
          marginTop: 2,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------- empty state */

export function EmptyState({
  emoji,
  title,
  body,
  action,
}: {
  emoji: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <Card style={{ alignItems: 'center', gap: t.space.sm, paddingVertical: t.space.xxl }}>
      <Text style={{ fontSize: 40 }}>{emoji}</Text>
      <TIText variant="h3" center>
        {title}
      </TIText>
      <TIText variant="small" tone="muted" center>
        {body}
      </TIText>
      {action ? <View style={{ marginTop: t.space.sm }}>{action}</View> : null}
    </Card>
  );
}

/* -------------------------------------------------------------------- disclaimer */

export function DisclaimerNote({ text }: { text: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.colors.subtle,
        borderRadius: t.radius.md,
        padding: t.space.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.colors.line,
      }}
    >
      <Text style={{ fontSize: 11.5, lineHeight: 17, color: t.colors.muted }}>{text}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------------- rows */

export function ListRow({
  emoji,
  title,
  subtitle,
  onPress,
  right,
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.md,
        paddingVertical: t.space.md,
        paddingHorizontal: t.space.lg,
        backgroundColor: pressed ? t.colors.subtle : 'transparent',
      })}
    >
      {emoji ? <Text style={{ fontSize: 20 }}>{emoji}</Text> : null}
      <View style={{ flex: 1 }}>
        <TIText variant="bodyStrong">{title}</TIText>
        {subtitle ? (
          <TIText variant="small" tone="muted">
            {subtitle}
          </TIText>
        ) : null}
      </View>
      {right ?? (
        <Text style={{ color: t.colors.muted, fontSize: 20, fontWeight: '300' }}>›</Text>
      )}
    </Pressable>
  );
}

export function Divider() {
  const t = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.line }} />;
}

/* ------------------------------------------------------------------------- ring */

/** Score ring. Pure View math so there's no SVG dependency. */
export function ScoreRing({
  value,
  size = 128,
  label,
}: {
  /** 0-100 */
  value: number;
  size?: number;
  label?: string;
}) {
  const t = useTheme();
  const thickness = 10;
  const pct = Math.max(0, Math.min(100, value));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: thickness,
        borderColor: t.isDark ? t.colors.subtle : '#E6F2EC',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Arc approximation: a rotated, clipped border ring reads well at these sizes. */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: thickness,
          borderColor: 'transparent',
          borderTopColor: pct > 0 ? t.colors.brand : 'transparent',
          borderRightColor: pct > 25 ? t.colors.brand : 'transparent',
          borderBottomColor: pct > 50 ? t.colors.brand : 'transparent',
          borderLeftColor: pct > 75 ? t.colors.brand : 'transparent',
          transform: [{ rotate: '-45deg' }],
          top: -thickness,
          left: -thickness,
        }}
      />
      <Text style={{ fontSize: 30, fontWeight: '800', color: t.colors.ink }}>
        {Math.round(pct)}
      </Text>
      {label ? (
        <Text style={{ ...t.type.overline, color: t.colors.muted, marginTop: 2 }}>
          {label.toUpperCase()}
        </Text>
      ) : null}
    </View>
  );
}
