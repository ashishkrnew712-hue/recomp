import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/shared/Typography';
import { Card } from '../../components/shared/Card';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { TARGETS, todayString, daysBetween } from '../../constants/targets';
import { getAllLogs, DailyLog } from '../../db/logs';
import { getAllScans, BodyScan } from '../../db/scans';
import { getRecentSessions } from '../../db/workouts';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - spacing.lg * 2 - spacing.lg * 2; // inside card padding

type Period = '7D' | '30D' | '90D' | 'All';

// ─── Simple sparkline SVG-free weight chart ───────────────────────────────────
function WeightChart({ logs, targetWeight }: { logs: DailyLog[]; targetWeight: number }) {
  if (logs.length < 2) {
    return (
      <View style={styles.emptyChart}>
        <Typography variant="bodyM" color={colors.textMuted}>Log more days to see chart</Typography>
      </View>
    );
  }

  const weights = logs.map((l) => l.weight_kg ?? 0).filter(Boolean);
  const max = Math.max(...weights, targetWeight) + 1;
  const min = Math.min(...weights, targetWeight) - 1;
  const range = max - min;
  const chartH = 120;
  const chartWInner = CHART_W - 8;

  const toY = (w: number) => chartH - ((w - min) / range) * chartH;
  const toX = (i: number) => (i / (logs.length - 1)) * chartWInner;

  const points = logs
    .filter((l) => l.weight_kg)
    .map((l, i) => `${toX(i)},${toY(l.weight_kg!)}`)
    .join(' ');

  const targetY = toY(targetWeight);

  // Simple bar-based mini chart using Views (no SVG dep needed)
  return (
    <View style={{ height: chartH + 24, position: 'relative' }}>
      {/* Target line label */}
      <View style={[styles.targetLine, { top: targetY }]}>
        <View style={styles.targetDash} />
        <Typography variant="label" color={colors.accent}>{targetWeight} kg</Typography>
      </View>
      {/* Points */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartH, gap: 2 }}>
        {logs.filter((l) => l.weight_kg).map((l, i) => {
          const h = Math.max(((l.weight_kg! - min) / range) * chartH, 2);
          return (
            <View
              key={l.date}
              style={{
                flex: 1,
                height: h,
                backgroundColor: colors.accent2 + '80',
                borderRadius: 2,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
              }}
            />
          );
        })}
      </View>
      {/* Axis labels */}
      <View style={styles.axisRow}>
        <Typography variant="label" color={colors.textMuted}>
          {logs.filter((l) => l.weight_kg)[0]?.date?.slice(5)}
        </Typography>
        <Typography variant="label" color={colors.textMuted}>
          {logs.filter((l) => l.weight_kg).at(-1)?.date?.slice(5)}
        </Typography>
      </View>
    </View>
  );
}

// ─── Workout heatmap (last 90 days) ──────────────────────────────────────────
function WorkoutHeatmap({ completedDates }: { completedDates: Set<string> }) {
  const days: string[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  const cellSize = Math.floor((SCREEN_W - spacing.lg * 4) / 13) - 2;

  return (
    <View style={styles.heatmap}>
      <View style={styles.heatmapGrid}>
        {days.map((d) => (
          <View
            key={d}
            style={[
              styles.heatCell,
              { width: cellSize, height: cellSize },
              completedDates.has(d) && styles.heatCellActive,
            ]}
          />
        ))}
      </View>
      <View style={styles.heatLegend}>
        <View style={[styles.heatCell, styles.heatCellInactive, { width: 12, height: 12 }]} />
        <Typography variant="label" color={colors.textMuted}>Rest</Typography>
        <View style={[styles.heatCell, styles.heatCellActive, { width: 12, height: 12 }]} />
        <Typography variant="label" color={colors.textMuted}>Workout</Typography>
      </View>
    </View>
  );
}

// ─── Main Progress Screen ─────────────────────────────────────────────────────
export default function ProgressScreen() {
  const [period, setPeriod] = useState<Period>('30D');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [scans, setScans] = useState<BodyScan[]>([]);
  const [completedWorkoutDates, setCompletedWorkoutDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLogs(getAllLogs());
    setScans(getAllScans());
    const sessions = getRecentSessions(90);
    setCompletedWorkoutDates(new Set(sessions.filter((s) => s.completed).map((s) => s.date)));
  }, []);

  const periodDays: Record<Period, number> = { '7D': 7, '30D': 30, '90D': 90, 'All': 9999 };
  const filteredLogs = logs.filter((l) => {
    const daysAgo = daysBetween(l.date, todayString());
    return daysAgo <= periodDays[period];
  });

  const latestScan = scans[0];
  const latestWeight = logs.find((l) => l.weight_kg)?.weight_kg ?? TARGETS.startWeightKg;
  const currentBfp = latestScan?.bfp ?? null;

  // ETA calculation
  const daysSinceStart = daysBetween(TARGETS.startDate, todayString());
  const fatLost = TARGETS.startWeightKg - latestWeight;
  const pace = fatLost / Math.max(daysSinceStart, 1);
  const remaining = latestWeight - TARGETS.targetWeightKg;
  const daysToGoal = pace > 0 ? Math.round(remaining / pace) : null;
  const etaDate = daysToGoal
    ? (() => {
        const d = new Date();
        d.setDate(d.getDate() + daysToGoal);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      })()
    : 'TBD';

  const periods: Period[] = ['7D', '30D', '90D', 'All'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant="displayS" color={colors.text} style={styles.screenTitle}>Progress</Typography>

        {/* BFP Hero */}
        <Card>
          <View style={styles.bfpHero}>
            <View>
              <Typography variant="label" color={colors.textMuted}>CURRENT BFP</Typography>
              <Typography variant="displayL" color={colors.text}>
                {currentBfp !== null ? currentBfp.toFixed(1) : '–'}
                <Typography variant="displayS" color={colors.textMuted}>%</Typography>
              </Typography>
            </View>
            <View style={styles.bfpTarget}>
              <Typography variant="label" color={colors.textMuted}>TARGET</Typography>
              <Typography variant="displayM" color={colors.accent}>{TARGETS.targetBfp}%</Typography>
              <Typography variant="label" color={colors.textMuted} style={{ marginTop: spacing.xs }}>ETA</Typography>
              <Typography variant="bodySemi" color={colors.text}>{etaDate}</Typography>
            </View>
          </View>
        </Card>

        {/* Period toggle */}
        <View style={styles.periodRow}>
          {periods.map((p) => (
            <Pressable
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Typography variant="label" color={period === p ? colors.bg : colors.textMuted}>{p}</Typography>
            </Pressable>
          ))}
        </View>

        {/* Weight trend */}
        <Card>
          <Typography variant="bodySemi" color={colors.text} style={{ marginBottom: spacing.md }}>Weight Trend</Typography>
          <WeightChart logs={filteredLogs} targetWeight={TARGETS.targetWeightKg} />
        </Card>

        {/* Protein adherence */}
        <Card>
          <Typography variant="bodySemi" color={colors.text} style={{ marginBottom: spacing.md }}>Protein Adherence</Typography>
          <View style={styles.proteinBars}>
            {filteredLogs.slice(0, 30).reverse().map((l) => {
              const met = l.protein_g >= TARGETS.proteinG * 0.9;
              const pct = Math.min((l.protein_g / TARGETS.proteinG), 1);
              return (
                <View key={l.date} style={styles.proteinBarCol}>
                  <View
                    style={[
                      styles.proteinBar,
                      { height: Math.max(pct * 60, 2), backgroundColor: met ? colors.accent : colors.textDim },
                    ]}
                  />
                </View>
              );
            })}
          </View>
          <View style={styles.adherenceLegend}>
            <View style={[styles.dot, { backgroundColor: colors.accent }]} />
            <Typography variant="label" color={colors.textMuted}>Met target</Typography>
            <View style={[styles.dot, { backgroundColor: colors.textDim }]} />
            <Typography variant="label" color={colors.textMuted}>Below target</Typography>
          </View>
        </Card>

        {/* Workout heatmap */}
        <Card>
          <Typography variant="bodySemi" color={colors.text} style={{ marginBottom: spacing.md }}>
            Workout Consistency — Last 90 Days
          </Typography>
          <WorkoutHeatmap completedDates={completedWorkoutDates} />
        </Card>

        {/* Body Scan History */}
        <View style={styles.sectionHeader}>
          <Typography variant="bodySemi" color={colors.text}>Body Scans</Typography>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.scansRow}>
            {scans.map((scan, i) => {
              const prev = scans[i + 1];
              const bfpDelta = prev?.bfp && scan.bfp ? scan.bfp - prev.bfp : null;
              return (
                <Card key={scan.id} style={styles.scanCard}>
                  <Typography variant="label" color={colors.textMuted}>{scan.scan_date}</Typography>
                  <Typography variant="displayS" color={colors.text}>
                    {scan.bfp?.toFixed(1) ?? '–'}%
                  </Typography>
                  <Typography variant="mono" color={colors.textMuted}>{scan.weight_kg?.toFixed(1) ?? '–'} kg</Typography>
                  {bfpDelta !== null && (
                    <Typography variant="mono" color={bfpDelta < 0 ? colors.success : colors.accent3}>
                      {bfpDelta > 0 ? '+' : ''}{bfpDelta.toFixed(1)}%
                    </Typography>
                  )}
                </Card>
              );
            })}
            <Card style={[styles.scanCard, styles.addScanCard]}>
              <Typography variant="displayS" color={colors.textMuted}>+</Typography>
              <Typography variant="label" color={colors.textMuted}>Add Scan</Typography>
            </Card>
          </View>
        </ScrollView>

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
  bfpHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bfpTarget: {
    alignItems: 'flex-end',
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  periodBtnActive: {
    backgroundColor: colors.accent,
  },
  emptyChart: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetLine: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    zIndex: 1,
    right: 0,
  },
  targetDash: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent + '80',
    width: 30,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  heatmap: {
    gap: spacing.sm,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  heatCell: {
    borderRadius: 2,
    backgroundColor: colors.surface2,
  },
  heatCellActive: {
    backgroundColor: colors.accent,
  },
  heatCellInactive: {
    backgroundColor: colors.surface2,
  },
  heatLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  proteinBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 70,
    gap: 2,
  },
  proteinBarCol: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  proteinBar: {
    borderRadius: 2,
  },
  adherenceLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  scansRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  scanCard: {
    width: 120,
    gap: spacing.xs,
  },
  addScanCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderColor: colors.textDim,
  },
});
