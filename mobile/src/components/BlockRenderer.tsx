import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ContentBlock } from '@/content/types';
import { useTheme } from '@/theme';
import { TIText } from './ui';

/**
 * Renders lesson body blocks. Each block type mirrors a device on the TaxIntuitive website
 * (tip panels, warning panels, the gross → minus → net flow, slip cards, comparison tables)
 * so lessons feel like the brand rather than generic text.
 */
export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space.md }}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </View>
  );
}

function Block({ block }: { block: ContentBlock }) {
  const t = useTheme();

  switch (block.type) {
    case 'paragraph':
      return <Text style={{ fontSize: 16, lineHeight: 26, color: t.colors.ink }}>{block.text}</Text>;

    case 'heading':
      return (
        <TIText variant="h3" style={{ marginTop: t.space.sm }}>
          {block.text}
        </TIText>
      );

    case 'bullets':
    case 'numbered':
      return (
        <View style={{ gap: t.space.sm }}>
          {block.items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: t.space.sm }}>
              <Text
                style={{
                  color: t.colors.brandDark,
                  fontWeight: '800',
                  fontSize: 15,
                  minWidth: block.type === 'numbered' ? 22 : 14,
                }}
              >
                {block.type === 'numbered' ? `${i + 1}.` : '•'}
              </Text>
              <Text style={{ flex: 1, fontSize: 16, lineHeight: 25, color: t.colors.ink }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      );

    case 'tip':
      return (
        <Panel
          bg={t.colors.tipBg}
          border={t.colors.tipLine}
          titleColor={t.colors.brandDark}
          title={block.title}
          text={block.text}
        />
      );

    case 'warning':
      return (
        <Panel
          bg={t.colors.warningBg}
          border={t.colors.warningLine}
          titleColor={t.colors.warningInk}
          title={block.title}
          text={block.text}
        />
      );

    case 'example':
      return (
        <Panel
          bg={t.colors.subtle}
          border={t.colors.line}
          titleColor={t.colors.muted}
          title={block.title ?? 'Example'}
          text={block.text}
        />
      );

    case 'flow':
      return (
        <View style={{ gap: t.space.sm }}>
          {block.steps.map((step, i) => {
            const tone =
              step.tone === 'minus'
                ? { bg: t.colors.warningBg, border: t.colors.warningLine, fg: t.colors.warningInk }
                : step.tone === 'plus'
                  ? { bg: t.colors.successBg, border: t.colors.success, fg: t.colors.success }
                  : { bg: t.colors.subtle, border: t.colors.line, fg: t.colors.ink };
            return (
              <View key={i} style={{ gap: t.space.xs }}>
                <View
                  style={{
                    backgroundColor: tone.bg,
                    borderColor: tone.border,
                    borderWidth: 1.5,
                    borderRadius: t.radius.lg,
                    padding: t.space.md,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontWeight: '800', fontSize: 15, color: tone.fg }}>
                    {step.label}
                  </Text>
                  {step.caption ? (
                    <Text style={{ fontSize: 12, color: t.colors.muted, marginTop: 2 }}>
                      {step.caption}
                    </Text>
                  ) : null}
                </View>
                {i < block.steps.length - 1 ? (
                  <Text style={{ textAlign: 'center', color: t.colors.muted, fontSize: 18 }}>↓</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      );

    case 'slips':
      return (
        <View style={{ gap: t.space.sm }}>
          {block.items.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                gap: t.space.md,
                backgroundColor: t.colors.subtle,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: t.colors.line,
                borderRadius: t.radius.lg,
                padding: t.space.md,
                alignItems: 'flex-start',
              }}
            >
              <View
                style={{
                  backgroundColor: t.colors.brand,
                  borderRadius: t.radius.sm,
                  paddingVertical: 5,
                  paddingHorizontal: t.space.sm,
                }}
              >
                <Text style={{ color: t.colors.onBrand, fontWeight: '800', fontSize: 12.5 }}>
                  {item.tag}
                </Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14.5, lineHeight: 21, color: t.colors.ink }}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      );

    case 'table':
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.colors.line,
              borderRadius: t.radius.md,
              overflow: 'hidden',
              minWidth: 320,
            }}
          >
            <View style={{ flexDirection: 'row', backgroundColor: t.colors.tipBg }}>
              {block.headers.map((h, i) => (
                <View key={i} style={{ flex: 1, padding: t.space.md }}>
                  <Text
                    style={{
                      ...t.type.overline,
                      color: t.colors.brandDark,
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </Text>
                </View>
              ))}
            </View>
            {block.rows.map((row, ri) => (
              <View
                key={ri}
                style={{
                  flexDirection: 'row',
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: t.colors.line,
                }}
              >
                {row.map((cell, ci) => (
                  <View key={ci} style={{ flex: 1, padding: t.space.md }}>
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        color: t.colors.ink,
                        fontWeight: ci === 0 ? '700' : '400',
                      }}
                    >
                      {cell}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );

    case 'terms':
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm }}>
          {block.items.map((term) => (
            <View
              key={term}
              style={{
                backgroundColor: t.colors.tipBg,
                borderRadius: t.radius.pill,
                paddingVertical: 6,
                paddingHorizontal: t.space.md,
              }}
            >
              <Text style={{ color: t.colors.brandDark, fontWeight: '700', fontSize: 12.5 }}>
                {term}
              </Text>
            </View>
          ))}
        </View>
      );
  }
}

function Panel({
  bg,
  border,
  titleColor,
  title,
  text,
}: {
  bg: string;
  border: string;
  titleColor: string;
  title?: string;
  text: string;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: bg,
        borderColor: border,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: t.radius.lg,
        padding: t.space.lg,
        gap: 4,
      }}
    >
      {title ? (
        <Text style={{ fontWeight: '800', fontSize: 13, color: titleColor }}>{title}</Text>
      ) : null}
      <Text style={{ fontSize: 15, lineHeight: 23, color: t.colors.ink }}>{text}</Text>
    </View>
  );
}
