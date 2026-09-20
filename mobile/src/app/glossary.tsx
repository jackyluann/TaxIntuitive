import React, { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { Card, EmptyState, Screen, TIText } from '@/components/ui';
import { useContent } from '@/providers/content';
import { useTheme } from '@/theme';

export default function GlossaryScreen() {
  const t = useTheme();
  const { content } = useContent();
  const [query, setQuery] = useState('');

  const terms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.glossary
      .filter((g) =>
        q.length === 0 ? true : `${g.term} ${g.definition}`.toLowerCase().includes(q),
      )
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [content.glossary, query]);

  return (
    <Screen>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search terms"
        placeholderTextColor={t.colors.muted}
        accessibilityLabel="Search glossary terms"
        autoCorrect={false}
        style={{
          backgroundColor: t.colors.card,
          borderRadius: t.radius.lg,
          borderWidth: 1,
          borderColor: t.colors.line,
          paddingHorizontal: t.space.lg,
          paddingVertical: 14,
          fontSize: 15,
          color: t.colors.ink,
        }}
      />
      {terms.length === 0 ? (
        <EmptyState emoji="📖" title="No matching terms" body="Try a different word." />
      ) : (
        terms.map((g) => (
          <Card key={g.term} style={{ gap: 4 }}>
            <TIText variant="h3" tone="brand">
              {g.term}
            </TIText>
            <TIText variant="small">{g.definition}</TIText>
          </Card>
        ))
      )}
      <View style={{ height: t.space.lg }} />
    </Screen>
  );
}
