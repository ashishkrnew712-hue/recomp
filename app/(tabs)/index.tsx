import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/shared/Typography';
import { Card } from '../../components/shared/Card';
import { TripleRing } from '../../components/home/TripleRing';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { TARGETS, todayString, missionProgress, estimateBfp, daysBetween } from '../../constants/targets';
import { WORKOUT_SCHEDULE, SPLIT_LABELS, EXERCISES, SplitType, SPLIT_SHORT } from '../../constants/workouts';
import { useLogStore } from '../../store/useLogStore';
import { useStreakStore } from '../../store/useStreakStore';
import { useGoalStore } from '../../store/useGoalStore';
import { getRecentLogs } from '../../db/logs';

export default function HomeScreen() {
  const { log, loadToday } = useLogStore();
  const { streak, refresh: refreshStreak } = useStreakStore();
  const { goals, loadGoals } = useGoalStore();

  useEffect(() => {
    loadToday();
    refreshStreak();
    loadGoals();
  }, []);

  // Current weight: use today's log weight, or most recent
  const recentLogs = getRecentLogs(7);
  const currentWeight = log?.weight_kg ?? recentLogs.find((l) => l.weight_kg)?.weight_kg ?? goals.startWeightKg;
  const weeklyAvg = recentLogs.filter((l) => l.weight_kg).length > 0
    ? recentLogs.filter((l) => l.weight_kg).reduce((s, l) => s + l.weight_kg!, 0) / recentLogs.filter((l) => l.weight_kg).length
    : currentWeight;

  const todaySplit: SplitType = WORKOUT_SCHEDULE[new Date().getDay()];
  const exercises = EXERCISES[todaySplit];

  const fatLossProgress = missionProgress(currentWeight);
  const calorieProgress = (log?.calories ?? 0) / TARGETS.calories;
  const proteinProgress = (log?.protein_g ?? 0) / TARGETS.proteinG;

  const currentBfp = estimateBfp(currentWeight);

  // Days to goal based on avg weekly pace
  const startDate = new Date(TARGETS.startDate);
  const today = new Date();
  const daysSinceStart = daysBetween(TARGETS.startDate, todayString());
  const totalFatToLose = TARGETS.startWeightKg - TARGETS.targetWeightKg;
  const fatLost = TARGETS.startWeightKg - currentWeight;
  const pace = fatLost / Math.max(daysSinceStart, 1); // kg/day
  const remaining = totalFatToLose - fatLost;
  const daysToGoal = pace > 0 ? Math.round(remaining / pace) : 180;

  const progressPct = Math.round(fatLossProgress * 100);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Typography variant="bodyM" color={colors.textMuted}>{greeting()},</Typography>
            <Typography variant="displayS" color={colors.text}>Ashish 👋</Typography>
          </View>
          <View style={styles.avatar}>
            <Typography variant="displayS" color={colors.bg}>A</Typography>
          </View>
        </View>

        {/* Triple Ring + Legend */}
        <Card style={styles.ringCard}>
          <View style={styles.ringRow}>
            <TripleRing
              fatLossProgress={fatLossProgress}
              calorieProgress={calorieProgress}
              proteinProgress={proteinProgress}
              size={140}
            />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: colors.accent3 }]} />
                <View>
                  <Typography variant="label" color={colors.textMuted}>FAT LOSS</Typography>
                  <Typography variant="monoSemi" color={colors.text}>{progressPct}%</Typography>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                <View>
                  <Typography variant="label" color={colors.textMuted}>CALORIES</Typography>
                  <Typography variant="monoSemi" color={colors.text}>
                    {log?.calories ?? 0}/{TARGETS.calories}
                  </Typography>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: colors.accent2 }]} />
                <View>
                  <Typography variant="label" color={colors.textMuted}>PROTEIN</Typography>
                  <Typography variant="monoSemi" color={colors.text}>
                    {log?.protein_g ?? 0}/{TARGETS.proteinG}g
                  </Typography>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Stat cards */}
        <View style={styles.statRow}>
          <Card style={styles.statCard}>
            <Typography variant="label" color={colors.textMuted}>WEIGHT</Typography>
            <Typography variant="displayS" color={colors.text}>{currentWeight.toFixed(1)}</Typography>
            <Typography variant="mono" color={colors.textMuted}>kg</Typography>
          </Card>
          <Card style={styles.statCard}>
            <Typography variant="label" color={colors.textMuted}>EST. BFP</Typography>
            <Typography variant="displayS" color={colors.accent2}>{currentBfp.toFixed(1)}</Typography>
            <Typography variant="mono" color={colors.textMuted}>%</Typography>
          </Card>
          <Card style={styles.statCard}>
            <Typography variant="label" color={colors.textMuted}>DAYS LEFT</Typography>
            <Typography variant="displayS" color={colors.accent}>{daysToGoal}</Typography>
            <Typography variant="mono" color={colors.textMuted}>est.</Typography>
          </Card>
        </View>

        {/* Streak */}
        <Card style={styles.streakCard}>
          <View style={styles.streakInner}>
            <Typography variant="displayL" color={colors.accent}>{streak}</Typography>
            <View>
              <Typography variant="displayS" color={colors.text}>Day Streak 🔥</Typography>
              <Typography variant="bodyM" color={colors.textMuted}>Keep it up — consistency wins</Typography>
            </View>
          </View>
        </Card>

        {/* Today's Mission */}
        <View style={styles.sectionHeader}>
          <Typography variant="bodySemi" color={colors.text}>Today's Mission</Typography>
          <Link href="/(tabs)/log" asChild>
            <Pressable>
              <Typography variant="bodySemi" color={colors.accent}>Log Now →</Typography>
            </Pressable>
          </Link>
        </View>

        <View style={[styles.missionCard, todaySplit === 'rest' && styles.missionCardRest]}>
          <Typography variant="displayS" color={colors.bg}>{SPLIT_SHORT[todaySplit]}</Typography>
          <Typography variant="bodySemi" color={colors.bg + 'CC'} style={{ marginBottom: spacing.md }}>
            {SPLIT_LABELS[todaySplit]}
          </Typography>
          {exercises.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.exerciseChips}>
                {exercises.map((ex) => (
                  <View key={ex.name} style={styles.exChip}>
                    <Typography variant="label" color={colors.bg}>{ex.name}</Typography>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
          <Link href="/(tabs)/log" asChild>
            <Pressable style={styles.startBtn}>
              <Typography variant="bodySemi" color={colors.accent}>Start Workout</Typography>
            </Pressable>
          </Link>
        </View>

        {/* Mission Progress bar */}
        <View style={styles.sectionHeader}>
          <Typography variant="bodySemi" color={colors.text}>Mission Progress</Typography>
          <Typography variant="mono" color={colors.textMuted}>
            {currentWeight.toFixed(1)} → {TARGETS.targetWeightKg} kg
          </Typography>
        </View>
        <Card>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.round(fatLossProgress * 100)}%` as any }]} />
          </View>
          <View style={styles.progressBarLabels}>
            <Typography variant="label" color={colors.textMuted}>{TARGETS.startWeightKg} kg</Typography>
            <Typography variant="label" color={colors.accent}>{progressPct}% complete</Typography>
            <Typography variant="label" color={colors.textMuted}>{TARGETS.targetWeightKg} kg</Typography>
          </View>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringCard: {
    padding: spacing.xl,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  legend: {
    flex: 1,
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.lg,
  },
  streakCard: {
    padding: spacing.xl,
  },
  streakInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  missionCard: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  missionCardRest: {
    backgroundColor: colors.surface2,
  },
  exerciseChips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  startBtn: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  progressBarTrack: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
