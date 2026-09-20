import React, { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { contact, DISCLAIMER } from '@/content';
import { Button, Card, DisclaimerNote, Screen, TIText } from '@/components/ui';
import { useContent } from '@/providers/content';
import { useTheme } from '@/theme';

export default function FaqScreen() {
  const t = useTheme();
  const { content } = useContent();
  const [open, setOpen] = useState<string | null>(null);

  const faqs = [...content.faqs].sort((a, b) => a.order - b.order);

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Text style={{ ...t.type.overline, color: t.colors.brandDark }}>
          FREQUENTLY ASKED QUESTIONS
        </Text>
        <TIText variant="h1">Your questions, answered</TIText>
        <TIText variant="small" tone="muted">
          New to taxes or new to TaxIntuitive? Start here.
        </TIText>
      </View>

      {faqs.map((faq) => {
        const expanded = open === faq.id;
        return (
          <Card key={faq.id} padded={false}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpen(expanded ? null : faq.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.space.md,
                padding: t.space.lg,
              }}
            >
              <Text style={{ flex: 1, fontWeight: '700', fontSize: 16, color: t.colors.ink }}>
                {faq.question}
              </Text>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  backgroundColor: expanded ? t.colors.brand : t.colors.tipBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '800',
                    color: expanded ? t.colors.onBrand : t.colors.brandDark,
                  }}
                >
                  {expanded ? '−' : '+'}
                </Text>
              </View>
            </Pressable>
            {expanded ? (
              <View style={{ paddingHorizontal: t.space.lg, paddingBottom: t.space.lg }}>
                <TIText variant="small" tone="muted">
                  {faq.answer}
                </TIText>
              </View>
            ) : null}
          </Card>
        );
      })}

      <Card
        style={{
          backgroundColor: t.colors.brandDark,
          borderColor: t.colors.brandDark,
          gap: t.space.sm,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '800', color: t.colors.onBrand }}>
          Still have a question?
        </Text>
        <Text style={{ color: t.colors.onBrand, opacity: 0.95, fontSize: 14, textAlign: 'center' }}>
          We&apos;re happy to help — reach out any time.
        </Text>
        <Button
          label="Email us"
          variant="ghost"
          onPress={() => void Linking.openURL(`mailto:${contact.email}`)}
        />
      </Card>

      <DisclaimerNote text={DISCLAIMER} />
    </Screen>
  );
}
