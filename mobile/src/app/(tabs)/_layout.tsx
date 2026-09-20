import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

/**
 * Five bottom tabs, as specified: Home, Learn, Quizzes, Videos, More.
 * Everything else (Simulator, XP, Achievements, Workshops, About, FAQ, Settings) lives under More
 * and is pushed with standard platform back navigation.
 */
export default function TabsLayout() {
  const t = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.colors.brandDark,
        tabBarInactiveTintColor: t.colors.muted,
        tabBarStyle: {
          backgroundColor: t.colors.card,
          borderTopColor: t.colors.line,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        headerStyle: { backgroundColor: t.colors.bg },
        headerTitleStyle: { color: t.colors.ink, fontWeight: '800' },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: t.colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          title: 'Quizzes',
          tabBarIcon: ({ color, size }) => <Ionicons name="bulb" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Videos',
          tabBarIcon: ({ color, size }) => <Ionicons name="play-circle" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
