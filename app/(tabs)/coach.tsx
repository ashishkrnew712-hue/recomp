import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/shared/Typography';
import { Card } from '../../components/shared/Card';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { TARGETS, todayString, daysBetween } from '../../constants/targets';
import { getRecentLogs } from '../../db/logs';
import { getRecentSessions } from '../../db/workouts';
import { getLatestScan } from '../../db/scans';

interface Nudge {
  id: string;
  icon: string;
  title: string;
  body: string;
  color: string;
}

function computeNudges(): Nudge[] {
  const nudges: Nudge[] = [];
  const today = todayString();
  const logs = getRecentLogs(14);
  const todayLog = logs.find((l) => l.date === today);

  // Protein nudge: if today's protein < 130g and hour >= 19
  if (todayLog && todayLog.protein_g < 130 && new Date().getHours() >= 19) {
    nudges.push({
      id: 'protein',
      icon: '🥩',
      title: 'Protein gap',
      body: `You've logged ${todayLog.protein_g}g protein today. Squeeze in a shake or chicken breast to hit ${TARGETS.proteinG}g.`,
      color: colors.accent2,
    });
  }

  // Refeed reminder: 7 consecutive days with calories < 1700
  const deficitDays = logs.filter((l) => l.calories > 0 && l.calories < 1700);
  if (deficitDays.length >= 7) {
    nudges.push({
      id: 'refeed',
      icon: '🍚',
      title: 'Refeed day due',
      body: `7+ days of hard deficit. Bump to ${TARGETS.refeedCalories} kcal today — keep protein, add carbs. Your metabolism will thank you.`,
      color: colors.warning,
    });
  }

  // Scan reminder: > 42 days since last scan
  const latestScan = getLatestScan();
  if (latestScan) {
    const daysSince = daysBetween(latestScan.scan_date, today);
    if (daysSince > 42) {
      nudges.push({
        id: 'scan',
        icon: '📊',
        title: 'Body scan overdue',
        body: `Last scan was ${daysSince} days ago. Book a Visbody scan to track actual BFP and muscle mass changes.`,
        color: colors.accent,
      });
    }
  }

  // Plateau alert: weight hasn't changed ±0.3kg in 10 days
  const last10 = logs.slice(0, 10).filter((l) => l.weight_kg);
  if (last10.length >= 5) {
    const weights = last10.map((l) => l.weight_kg!);
    const maxW = Math.max(...weights);
    const minW = Math.min(...weights);
    if (maxW - minW < 0.3) {
      nudges.push({
        id: 'plateau',
        icon: '📉',
        title: 'Weight plateau detected',
        body: `Weight has been within 0.3kg for 10 days. Consider adjusting calories down by 100–150 kcal or adding a cardio session.`,
        color: colors.accent3,
      });
    }
  }

  return nudges;
}

function weeklySummary() {
  const logs = getRecentLogs(7);
  const sessions = getRecentSessions(7);
  const completed = sessions.filter((s) => s.completed).length;

  const withWeight = logs.filter((l) => l.weight_kg);
  const avgWeight = withWeight.length
    ? withWeight.reduce((s, l) => s + l.weight_kg!, 0) / withWeight.length
    : null;

  const withProtein = logs.filter((l) => l.protein_g > 0);
  const avgProtein = withProtein.length
    ? withProtein.reduce((s, l) => s + l.protein_g, 0) / withProtein.length
    : 0;

  const proteinOk = avgProtein >= TARGETS.proteinG * 0.9;
  const workoutsOk = completed >= 4;

  let verdict = 'Needs Work';
  let verdictColor: string = colors.accent3;
  if (proteinOk && workoutsOk) { verdict = 'Strong Week'; verdictColor = colors.success; }
  else if (proteinOk || workoutsOk) { verdict = 'Good Progress'; verdictColor = colors.accent; }

  let summary = '';
  if (avgWeight) {
    summary += `Avg weight this week: **${avgWeight.toFixed(1)} kg**. `;
  }
  summary += `Workouts completed: **${completed}/7**. `;
  summary += `Avg protein: **${Math.round(avgProtein)}g/day** (target: ${TARGETS.proteinG}g). `;

  if (verdict === 'Strong Week') {
    summary += 'Great consistency — fat loss pace is on track. Keep the deficit clean.';
  } else if (verdict === 'Good Progress') {
    summary += proteinOk
      ? 'Protein is solid. Try to hit 4+ workouts next week.'
      : 'Workout frequency is solid. Focus on hitting protein target daily.';
  } else {
    summary += 'Tough week — that happens. Reset tomorrow and focus on protein first.';
  }

  return { verdict, verdictColor, summary, completed, avgProtein: Math.round(avgProtein), avgWeight };
}

export default function CoachScreen() {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [summary, setSummary] = useState<ReturnType<typeof weeklySummary> | null>(null);
  const [askText, setAskText] = useState('');

  useEffect(() => {
    try {
      setNudges(computeNudges());
      setSummary(weeklySummary());
    } catch {
      // DB not ready yet
    }
  }, []);

  const renderBold = (text: string) => {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return (
      <Typography variant="bodyM" color={colors.text}>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <Typography key={i} variant="bodySemi" color={colors.accent}>{part}</Typography>
          ) : part
        )}
      </Typography>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant="displayS" color={colors.text} style={styles.screenTitle}>AI Coach</Typography>

        {/* Weekly Summary */}
        {summary && (
          <Card>
            <View style={styles.summaryHeader}>
              <Typography variant="label" color={colors.textMuted}>WEEKLY SUMMARY</Typography>
              <View style={[styles.verdictBadge, { backgroundColor: summary.verdictColor + '20', borderColor: summary.verdictColor + '40' }]}>
                <Typography variant="label" color={summary.verdictColor}>{summary.verdict.toUpperCase()}</Typography>
              </View>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Typography variant="displayS" color={colors.text}>{summary.completed}</Typography>
                <Typography variant="label" color={colors.textMuted}>WORKOUTS</Typography>
              </View>
              <View style={styles.summaryStat}>
                <Typography variant="displayS" color={colors.accent2}>{summary.avgProtein}g</Typography>
                <Typography variant="label" color={colors.textMuted}>AVG PROTEIN</Typography>
              </View>
              {summary.avgWeight && (
                <View style={styles.summaryStat}>
                  <Typography variant="displayS" color={colors.text}>{summary.avgWeight.toFixed(1)}</Typography>
                  <Typography variant="label" color={colors.textMuted}>AVG WEIGHT</Typography>
                </View>
              )}
            </View>
            <View style={{ marginTop: spacing.md }}>
              {renderBold(summary.summary)}
            </View>
          </Card>
        )}

        {/* Smart Nudges */}
        {nudges.length > 0 && (
          <>
            <Typography variant="bodySemi" color={colors.text} style={{ marginTop: spacing.sm }}>
              Nudges
            </Typography>
            {nudges.map((nudge) => (
              <Card key={nudge.id} style={[styles.nudgeCard, { borderLeftColor: nudge.color, borderLeftWidth: 3 }]}>
                <View style={styles.nudgeHeader}>
                  <Typography style={{ fontSize: 22 }}>{nudge.icon}</Typography>
                  <Typography variant="bodySemi" color={colors.text}>{nudge.title}</Typography>
                </View>
                <Typography variant="bodyM" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
                  {nudge.body}
                </Typography>
              </Card>
            ))}
          </>
        )}

        {nudges.length === 0 && (
          <Card style={styles.allGoodCard}>
            <Typography style={{ fontSize: 32, textAlign: 'center' }}>✅</Typography>
            <Typography variant="bodySemi" color={colors.text} style={{ textAlign: 'center' }}>
              All good — no nudges today
            </Typography>
            <Typography variant="bodyM" color={colors.textMuted} style={{ textAlign: 'center' }}>
              Keep up the consistency. Log today and come back tomorrow.
            </Typography>
          </Card>
        )}

        {/* Ask Coach (Phase 2 placeholder) */}
        <Typography variant="bodySemi" color={colors.text} style={{ marginTop: spacing.sm }}>
          Ask Coach
        </Typography>
        <Card style={styles.askCard}>
          <View style={styles.phase2Banner}>
            <Ionicons name="flash-outline" size={18} color={colors.accent} />
            <Typography variant="label" color={colors.accent}>PHASE 2 — CLAUDE API</Typography>
          </View>
          <Typography variant="bodyM" color={colors.textMuted} style={{ marginBottom: spacing.md }}>
            Ask anything about your training, nutrition, or progress. Connect your Claude API key in Profile → Integrations to unlock.
          </Typography>
          <View style={styles.askRow}>
            <TextInput
              style={styles.askInput}
              value={askText}
              onChangeText={setAskText}
              placeholder="Why is my weight up this week?"
              placeholderTextColor={colors.textDim}
              editable={false}
            />
            <Pressable style={styles.askBtn}>
              <Ionicons name="send" size={18} color={colors.bg} />
            </Pressable>
          </View>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  screenTitle: { marginBottom: spacing.sm },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  verdictBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  summaryStat: {
    gap: 2,
  },
  nudgeCard: {
    gap: spacing.xs,
  },
  nudgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  allGoodCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  askCard: {
    gap: spacing.sm,
  },
  phase2Banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  askRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  askInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
  },
  askBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
