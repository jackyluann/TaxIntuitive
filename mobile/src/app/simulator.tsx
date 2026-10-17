import { AppIcon } from '@/components/AppIcon';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { SimulatorOption } from '@/content/types';
import type { SimulatorTier } from '@/lib/xp/types';
import { Button, Card, DisclaimerNote, Pill, ProgressBar, StatTile, TIText } from '@/components/ui';
import { useContent } from '@/providers/content';
import { useProgress } from '@/providers/progress';
import { useTheme } from '@/theme';

interface RunState {
  cash: number;
  savings: number;
  debt: number;
  income: number;
  expenses: number;
  estimatedTax: number;
  smarts: number;
  lessons: string[];
}

type Phase = 'intro' | 'playing' | 'result';

/** "Survive Your First Year" — works fully offline and needs no account. */
export default function SimulatorScreen() {
  const t = useTheme();
  const router = useRouter();
  const { content } = useContent();
  const { recordSimulatorRun } = useProgress();
  const config = content.simulator;

  const scenarios = useMemo(
    () => [...config.scenarios].sort((a, b) => a.order - b.order),
    [config.scenarios],
  );

  const maxSmarts = useMemo(
    () =>
      scenarios.reduce(
        (sum, s) => sum + Math.max(...s.options.map((o) => o.smartsDelta), 0),
        0,
      ),
    [scenarios],
  );

  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<SimulatorOption | null>(null);
  const [run, setRun] = useState<RunState>({
    cash: config.startingCash,
    savings: 0,
    debt: 0,
    income: 0,
    expenses: 0,
    estimatedTax: 0,
    smarts: 0,
    lessons: [],
  });

  const scenario = scenarios[step];

  const start = () => {
    setRun({
      cash: config.startingCash,
      savings: 0,
      debt: 0,
      income: 0,
      expenses: 0,
      estimatedTax: 0,
      smarts: 0,
      lessons: [],
    });
    setStep(0);
    setPicked(null);
    setPhase('playing');
  };

  const choose = (option: SimulatorOption) => {
    if (picked) return;
    setPicked(option);
    setRun((prev) => ({
      cash: prev.cash + option.cashDelta,
      savings: prev.savings + (option.savingsDelta ?? 0),
      debt: prev.debt + (option.debtDelta ?? 0),
      income: prev.income + (option.incomeDelta ?? 0),
      expenses: prev.expenses + (option.expenseDelta ?? 0),
      estimatedTax: prev.estimatedTax + (option.estimatedTaxDelta ?? 0),
      smarts: prev.smarts + option.smartsDelta,
      lessons: option.lesson ? [...prev.lessons, option.lesson] : prev.lessons,
    }));
    void Haptics.impactAsync(
      option.cashDelta < 0 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => {});
  };

  const next = () => {
    if (step < scenarios.length - 1) {
      setStep((s) => s + 1);
      setPicked(null);
      return;
    }
    finish();
  };

  const finish = () => {
    const tier = tierFor(run.cash, run.smarts, maxSmarts);
    setPhase('result');
    void recordSimulatorRun({
      finalCash: run.cash,
      finalSavings: run.savings,
      finalDebt: run.debt,
      moneySmarts: run.smarts,
      maxMoneySmarts: maxSmarts,
      tier,
      lessons: Array.from(new Set(run.lessons)),
    });
  };

  /* ------------------------------------------------------------------------ intro */
  if (phase === 'intro') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg }}>
          <Card style={{ gap: t.space.md }}>
            <Pill label="THE SIMULATOR" />
            <TIText variant="h1">Can you survive your first year after high school?</TIText>
            <TIText variant="small" tone="muted">
              You&apos;re {config.startingAge}. You just moved out and landed a part-time job at $
              {config.hourlyWage}/hour. Over the next year you&apos;ll make real money decisions —
              some about taxes, some about life. Every choice moves your bank balance and your money
              smarts. Make it to the end without going broke.
            </TIText>
            <View style={{ flexDirection: 'row', gap: t.space.md }}>
              <StatTile label="Starting cash" value={money(config.startingCash)} />
              <StatTile label="Money smarts" value="0" tone="accent" />
            </View>
            <Button label="Start your first year →" onPress={start} fullWidth />
          </Card>
          <DisclaimerNote text="A learning game — not financial or tax advice. Numbers are simplified to teach the ideas." />
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ----------------------------------------------------------------------- result */
  if (phase === 'result') {
    const tier = tierFor(run.cash, run.smarts, maxSmarts);
    const verdict = VERDICTS[tier];
    const uniqueLessons = Array.from(new Set(run.lessons));

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg }}>
          <Card style={{ alignItems: 'center', gap: t.space.sm }}>
            <AppIcon size={54} name={verdict.icon} />
            <TIText variant="h1" center>
              {verdict.title}
            </TIText>
            <TIText variant="small" tone="muted" center>
              {verdict.body}
            </TIText>
          </Card>

          <View style={{ flexDirection: 'row', gap: t.space.md }}>
            <StatTile label="Final cash" value={money(run.cash)} />
            <StatTile label="Savings" value={money(run.savings)} tone="accent" />
          </View>
          <View style={{ flexDirection: 'row', gap: t.space.md }}>
            <StatTile label="Debt" value={money(run.debt)} tone="ink" />
            <StatTile label="Money smarts" value={`${run.smarts}/${maxSmarts}`} tone="accent" />
          </View>

          {run.estimatedTax > 0 ? (
            <Card style={{ gap: 4 }}>
              <TIText variant="bodyStrong">Estimated tax set aside: {money(run.estimatedTax)}</TIText>
              <TIText variant="caption" tone="muted">
                Self-employed income has no tax withheld, so saving for it yourself avoids a surprise
                bill.
              </TIText>
            </Card>
          ) : null}

          {uniqueLessons.length ? (
            <Card style={{ gap: t.space.sm }}>
              <Text style={{ ...t.type.overline, color: t.colors.brandDark }}>
                WHAT THIS YEAR TAUGHT YOU
              </Text>
              {uniqueLessons.map((lesson, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: t.space.sm }}>
                  <Text style={{ color: t.colors.brandDark }}>•</Text>
                  <Text style={{ flex: 1, fontSize: 14, lineHeight: 21, color: t.colors.muted }}>
                    {lesson}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}

          <Card style={{ gap: t.space.sm }}>
            <TIText variant="bodyStrong">How to do better</TIText>
            {verdict.tips.map((tip, i) => (
              <TIText key={i} variant="small" tone="muted">
                • {tip}
              </TIText>
            ))}
          </Card>

          <View style={{ gap: t.space.sm }}>
            <Button label="Play again" variant="accent" onPress={start} fullWidth />
            <Button
              label="Back to learning"
              variant="outline"
              onPress={() => router.replace('/learn')}
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ---------------------------------------------------------------------- playing */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: t.space.lg, gap: t.space.lg }}>
        <View style={{ flexDirection: 'row', gap: t.space.md }}>
          <StatTile
            label="Bank balance"
            value={money(run.cash)}
            tone={run.cash < 0 ? 'accent' : 'brand'}
          />
          <StatTile label="Money smarts" value={`${run.smarts}`} tone="accent" />
        </View>

        <View style={{ gap: 6 }}>
          <ProgressBar value={step / scenarios.length} />
          <TIText variant="overline" tone="muted">
            {scenario.monthLabel.toUpperCase()}
          </TIText>
        </View>

        <TIText variant="h2">{scenario.prompt}</TIText>

        <View style={{ gap: t.space.sm }}>
          {scenario.options.map((option) => {
            const isPicked = picked?.id === option.id;
            const dim = picked !== null && !isPicked;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ disabled: picked !== null, selected: isPicked }}
                disabled={picked !== null}
                onPress={() => choose(option)}
                style={{
                  backgroundColor: t.colors.card,
                  borderWidth: 1.5,
                  borderColor: isPicked ? t.colors.brand : t.colors.line,
                  borderRadius: t.radius.lg,
                  padding: t.space.lg,
                  opacity: dim ? 0.5 : 1,
                  minHeight: 56,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 15, lineHeight: 22, color: t.colors.ink }}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {picked ? (
          <>
            <Card
              style={{
                backgroundColor:
                  picked.cashDelta > 0
                    ? t.colors.successBg
                    : picked.cashDelta < 0
                      ? t.colors.dangerBg
                      : t.colors.tipBg,
                borderColor:
                  picked.cashDelta > 0
                    ? t.colors.success
                    : picked.cashDelta < 0
                      ? t.colors.danger
                      : t.colors.tipLine,
                gap: 4,
              }}
            >
              <TIText variant="bodyStrong">
                {picked.cashDelta !== 0
                  ? `${picked.cashDelta > 0 ? '+' : ''}${money(picked.cashDelta)}  ·  `
                  : ''}
                +{picked.smartsDelta} money smarts
              </TIText>
              <TIText variant="small">{picked.feedback}</TIText>
            </Card>
            <Button
              label={step === scenarios.length - 1 ? 'See your results →' : 'Next month →'}
              onPress={next}
              fullWidth
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------------ helpers */

function money(n: number) {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-CA')}`;
}

export function tierFor(cash: number, smarts: number, maxSmarts: number): SimulatorTier {
  if (cash < 0) return 'broke';
  const ratio = maxSmarts > 0 ? smarts / maxSmarts : 0;
  if (ratio >= 0.85) return 'gold';
  if (ratio >= 0.6) return 'silver';
  return 'bronze';
}

const VERDICTS: Record<
  SimulatorTier,
  { icon: string; title: string; body: string; tips: string[] }
> = {
  broke: {
    icon: 'wallet-outline',
    title: 'You ran out of money',
    body: 'Year one got the better of your wallet — but every lesson below is a second chance.',
    tips: [
      'Build a small emergency fund before anything else.',
      'Avoid putting wants on a credit card you cannot pay off.',
      'File your return — at low incomes it usually pays you.',
    ],
  },
  bronze: {
    icon: 'medal-outline',
    title: 'Bronze — Getting There',
    body: 'You survived. Review the lessons and play again to level up your money smarts.',
    tips: [
      'Automate a transfer to savings every payday.',
      'Keep every tax slip, even the boring-looking ones.',
      'Set aside tax on any self-employed income as it arrives.',
    ],
  },
  silver: {
    icon: 'medal-outline',
    title: 'Silver — Money Smart',
    body: "Strong year! A few sharper money moves and you'll be untouchable.",
    tips: [
      'Grow your emergency fund toward a few months of expenses.',
      'Use a TFSA so savings grow tax-free.',
      'Check your TD1 so withholding matches your situation.',
    ],
  },
  gold: {
    icon: 'medal-outline',
    title: 'Gold — Financially Literate!',
    body: 'Outstanding. You handled taxes, savings and surprises like a pro.',
    tips: [
      'Keep the habits: file on time, save automatically, avoid high-interest debt.',
      'Learn how TFSA and RRSP fit your own goals.',
      'Help a friend file their first return.',
    ],
  },
};
