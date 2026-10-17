import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/providers/auth';
import { ContentProvider } from '@/providers/content';
import { ProgressProvider } from '@/providers/progress';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* already hidden */
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ContentProvider>
          <AuthProvider>
            <ProgressProvider>
              <RootStack />
            </ProgressProvider>
          </AuthProvider>
        </ContentProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const t = useTheme();

  React.useEffect(() => {
    // Content is bundled, so there is nothing to wait for: show the app immediately.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.colors.bg },
          headerTitleStyle: { color: t.colors.ink, fontWeight: '800' },
          headerTintColor: t.colors.brandDark,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: t.colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[id]" options={{ title: '', headerBackTitle: 'Back' }} />
        <Stack.Screen name="quiz/[id]" options={{ title: 'Quiz', headerBackTitle: 'Back' }} />
        <Stack.Screen name="video/[id]" options={{ title: '', headerBackTitle: 'Back' }} />
        <Stack.Screen name="glossary" options={{ title: 'Tax Glossary' }} />
        <Stack.Screen name="xp" options={{ title: 'XP Tracker' }} />
        <Stack.Screen name="achievements" options={{ title: 'Achievements' }} />
        <Stack.Screen name="simulator" options={{ title: 'Tax Simulator' }} />
        <Stack.Screen name="workshops" options={{ title: 'Workshops' }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
        <Stack.Screen name="faq" options={{ title: 'FAQ' }} />
        <Stack.Screen name="reset-password" options={{ title: 'Reset password' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="disclaimer" options={{ title: 'Educational Disclaimer' }} />
        <Stack.Screen name="duo/index" options={{ title: 'Quiz Duo' }} />
        <Stack.Screen name="duo/[matchId]" options={{ title: 'Quiz Duo', headerBackVisible: false }} />
        <Stack.Screen
          name="auth/sign-in"
          options={{ title: 'Sign in', presentation: 'modal' }}
        />
        <Stack.Screen
          name="auth/sign-up"
          options={{ title: 'Create account', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
