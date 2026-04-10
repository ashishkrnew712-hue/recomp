import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/shared/Typography';
import { Card } from '../../components/shared/Card';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { TARGETS, todayString } from '../../constants/targets';
import { useGoalStore } from '../../store/useGoalStore';
import { useStreakStore } from '../../store/useStreakStore';
import { getRecentLogs, getAllLogs } from '../../db/logs';
import { getLatestScan } from '../../db/scans';

function StatGrid({ stats }: { stats: Array<{ label: string; value: string; color?: string }> }) {
  return (
    <View style={styles.statGrid}>
      {stats.map((s) => (
        <View key={s.label} style={styles.statCell}>
          <Typography variant="displayS" color={s.color ?? colors.text}>{s.value}</Typography>
          <Typography variant="label" color={colors.textMuted}>{s.label}</Typography>
        </View>
      ))}
    </View>
  );
}

function SettingRow({
  label,
  value,
  onPress,
  rightElement,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <Pressable style={styles.settingRow} onPress={onPress}>
      <Typography variant="bodyM" color={colors.text}>{label}</Typography>
      {rightElement ?? (
        <View style={styles.settingRight}>
          {value && <Typography variant="bodyM" color={colors.textMuted}>{value}</Typography>}
          {onPress && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
        </View>
      )}
    </Pressable>
  );
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingGroup}>
      <Typography variant="label" color={colors.textMuted} style={styles.groupTitle}>
        {title.toUpperCase()}
      </Typography>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {children}
      </Card>
    </View>
  );
}

export default function ProfileScreen() {
  const { goals, loadGoals, updateGoal } = useGoalStore();
  const { streak, refresh: refreshStreak } = useStreakStore();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [nudgesOn, setNudgesOn] = useState(true);

  const recentLogs = getRecentLogs(7);
  const currentWeight = recentLogs.find((l) => l.weight_kg)?.weight_kg ?? goals.startWeightKg;
  const latestScan = getLatestScan();

  useEffect(() => {
    loadGoals();
    refreshStreak();
  }, []);

  const handleExport = () => {
    const logs = getAllLogs();
    const csv = [
      'date,weight_kg,calories,protein_g,carbs_g,fat_g,mood',
      ...logs.map((l) =>
        [l.date, l.weight_kg ?? '', l.calories, l.protein_g, l.carbs_g, l.fat_g, l.mood ?? ''].join(',')
      ),
    ].join('\n');
    Alert.alert('Export Ready', `${logs.length} rows of data ready.\n\n(Sharing to files requires expo-sharing in Phase 2)`, [
      { text: 'OK' },
    ]);
  };

  const stats = [
    { label: 'START', value: `${goals.startWeightKg}`, color: colors.textMuted },
    { label: 'CURRENT', value: `${currentWeight.toFixed(1)}`, color: colors.text },
    { label: 'TARGET', value: `${goals.targetWeightKg}`, color: colors.accent },
    { label: 'BFP NOW', value: latestScan?.bfp ? `${latestScan.bfp.toFixed(1)}%` : '–', color: colors.accent2 },
    { label: 'BFP GOAL', value: `${goals.targetBfp}%`, color: colors.accent },
    { label: 'STREAK', value: `${streak}d 🔥`, color: colors.warning },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Typography variant="displayM" color={colors.bg}>A</Typography>
          </View>
          <View>
            <Typography variant="displayS" color={colors.text}>Ashish</Typography>
            <Typography variant="bodyM" color={colors.textMuted}>
              {goals.age} · Male · {goals.heightCm}cm
            </Typography>
          </View>
        </View>

        {/* Stats grid */}
        <Card>
          <StatGrid stats={stats} />
        </Card>

        {/* Goals & Plan */}
        <SettingGroup title="Goals & Plan">
          <SettingRow
            label="Daily Calories"
            value={`${goals.dailyCalories} kcal`}
            onPress={() => Alert.prompt(
              'Daily Calories',
              'Enter target calories',
              (v) => { if (v) updateGoal('dailyCalories', parseInt(v)); },
              'plain-text',
              String(goals.dailyCalories),
              'number-pad'
            )}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Daily Protein"
            value={`${goals.dailyProteinG}g`}
            onPress={() => Alert.prompt(
              'Daily Protein',
              'Enter protein target (g)',
              (v) => { if (v) updateGoal('dailyProteinG', parseInt(v)); },
              'plain-text',
              String(goals.dailyProteinG),
              'number-pad'
            )}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Daily Carbs"
            value={`${goals.dailyCarbsG}g`}
            onPress={() => Alert.prompt(
              'Daily Carbs',
              'Enter carbs target (g)',
              (v) => { if (v) updateGoal('dailyCarbsG', parseInt(v)); },
              'plain-text',
              String(goals.dailyCarbsG),
              'number-pad'
            )}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Daily Fat"
            value={`${goals.dailyFatG}g`}
            onPress={() => Alert.prompt(
              'Daily Fat',
              'Enter fat target (g)',
              (v) => { if (v) updateGoal('dailyFatG', parseInt(v)); },
              'plain-text',
              String(goals.dailyFatG),
              'number-pad'
            )}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Target Weight"
            value={`${goals.targetWeightKg} kg`}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Start Date"
            value={goals.startDate}
          />
        </SettingGroup>

        {/* Integrations */}
        <SettingGroup title="Integrations">
          <View style={styles.settingRow}>
            <Typography variant="bodyM" color={colors.text}>Amazfit T-Rex 3</Typography>
            <View style={styles.comingSoonBadge}>
              <Typography variant="label" color={colors.textMuted}>Phase 3</Typography>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Typography variant="bodyM" color={colors.text}>AI Coach (Claude API)</Typography>
            <View style={styles.comingSoonBadge}>
              <Typography variant="label" color={colors.accent}>Phase 2</Typography>
            </View>
          </View>
          <View style={styles.divider} />
          <SettingRow label="Export Data (CSV)" onPress={handleExport} />
        </SettingGroup>

        {/* Notifications */}
        <SettingGroup title="Notifications">
          <View style={styles.settingRow}>
            <View>
              <Typography variant="bodyM" color={colors.text}>Daily Log Reminder</Typography>
              <Typography variant="bodyM" color={colors.textMuted}>8:00 AM</Typography>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.bg}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View>
              <Typography variant="bodyM" color={colors.text}>Coach Nudges</Typography>
              <Typography variant="bodyM" color={colors.textMuted}>Rule-based alerts</Typography>
            </View>
            <Switch
              value={nudgesOn}
              onValueChange={setNudgesOn}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.bg}
            />
          </View>
        </SettingGroup>

        {/* App info */}
        <View style={styles.appInfo}>
          <Typography variant="label" color={colors.textDim}>RECOMP v1.0.0</Typography>
          <Typography variant="label" color={colors.textDim}>Built for Ashish · March–August 2026</Typography>
        </View>

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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCell: {
    width: '30%',
    gap: 2,
  },
  settingGroup: {
    gap: spacing.sm,
  },
  groupTitle: {
    paddingHorizontal: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  comingSoonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appInfo: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.lg,
  },
});
