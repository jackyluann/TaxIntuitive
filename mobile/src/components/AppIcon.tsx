import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

const legacyIcons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {'🧾': 'receipt-outline', '💵': 'cash-outline', '📄': 'document-text-outline', '🚀': 'rocket-outline', '⏰': 'time-outline', '🎁': 'gift-outline', '🛴': 'bicycle-outline', '🌱': 'leaf-outline', '🏦': 'business-outline', '💳': 'card-outline', '📖': 'book-outline', '📘': 'book-outline', '🧠': 'bulb-outline', '🎯': 'locate-outline', '🎮': 'game-controller-outline', '🥇': 'medal-outline', '🥈': 'medal-outline', '🥉': 'medal-outline', '🔥': 'flame-outline', '⚡': 'flash-outline', '🏅': 'ribbon-outline', '⭐': 'star-outline', '🤝': 'people-outline', '👑': 'ribbon-outline', '🏆': 'trophy-outline', '🎓': 'school-outline', '💬': 'chatbubble-outline', '❓': 'help-circle-outline', '⚙️': 'settings-outline', '🔒': 'lock-closed-outline', '⚠️': 'warning-outline', '📊': 'stats-chart-outline', '🗑️': 'trash-outline', '🔍': 'search-outline', '🎥': 'videocam-outline', '📚': 'library-outline', '🔖': 'bookmark', '📑': 'bookmark-outline', '💸': 'wallet-outline', '🚪': 'exit-outline', '💪': 'fitness-outline'};

export function AppIcon({ name, size = 24, color }: { name: string; size?: number; color?: string }) {
  const t = useTheme();
  const resolved = legacyIcons[name] ?? name;
  const safeName = Object.prototype.hasOwnProperty.call(Ionicons.glyphMap, resolved)
    ? resolved as React.ComponentProps<typeof Ionicons>['name'] : 'ellipse-outline';
  return <Ionicons name={safeName} size={size} color={color ?? t.colors.brandDark} accessible={false} aria-hidden={true} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}
