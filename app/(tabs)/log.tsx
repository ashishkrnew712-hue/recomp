import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../../components/shared/Typography';
import { Card } from '../../components/shared/Card';
import { MacroDial } from '../../components/log/MacroDial';
import { MealRow } from '../../components/log/MealRow';
import { ExerciseRow } from '../../components/log/ExerciseRow';
import { RestTimer } from '../../components/log/RestTimer';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { EXERCISES, WORKOUT_SCHEDULE, SPLIT_LABELS, SplitType, SPLIT_SHORT } from '../../constants/workouts';
import { TARGETS, todayString } from '../../constants/targets';
import { useLogStore } from '../../store/useLogStore';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { getMealsForDate, insertMeal, deleteMeal, Meal } from '../../db/meals';
import { getRecentLogs } from '../../db/logs';
import { BottomSheet } from '../../components/shared/BottomSheet';

type Tab = 'body' | 'nutrition' | 'workout';

// ─── Body Tab ────────────────────────────────────────────────────────────────

function BodyTab() {
  const { log, saveField, loadToday } = useLogStore();

  const [weight, setWeight] = useState(log?.weight_kg ? String(log.weight_kg) : '');
  const [waist, setWaist] = useState(log?.waist_cm ? String(log.waist_cm) : '');
  const [hips, setHips] = useState(log?.hips_cm ? String(log.hips_cm) : '');
  const [mood, setMood] = useState<number | null>(log?.mood ?? null);
  const [notes, setNotes] = useState(log?.notes ?? '');
  const [showOptional, setShowOptional] = useState(false);

  // Previous weight for delta
  const recent = getRecentLogs(7);
  const prevWeight = recent.find((l) => l.date !== todayString())?.weight_kg ?? null;

  const delta = weight && prevWeight ? (parseFloat(weight) - prevWeight).toFixed(1) : null;

  const handleSave = () => {
    saveField({
      weight_kg: weight ? parseFloat(weight) : undefined,
      waist_cm: waist ? parseFloat(waist) : undefined,
      hips_cm: hips ? parseFloat(hips) : undefined,
      mood: mood ?? undefined,
      notes: notes || undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    loadToday();
  };

  const moods = [
    { value: 1, emoji: '😴', label: 'Tired' },
    { value: 2, emoji: '😐', label: 'OK' },
    { value: 3, emoji: '💪', label: 'Strong' },
    { value: 4, emoji: '🔥', label: 'Fire' },
  ];

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabScroll} showsVerticalScrollIndicator={false}>
      {/* Weight Input */}
      <Card style={styles.weightCard}>
        <Typography variant="label" color={colors.textMuted}>TODAY'S WEIGHT</Typography>
        <View style={styles.weightRow}>
          <Pressable
            style={styles.stepBtn}
            onPress={() => {
              const v = (parseFloat(weight) || 0) - 0.1;
              setWeight(v.toFixed(1));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.weightInputArea}>
            <TextInput
              style={styles.weightInput}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="0.0"
              placeholderTextColor={colors.textDim}
            />
            <Typography variant="displayS" color={colors.textMuted}>kg</Typography>
          </View>
          <Pressable
            style={styles.stepBtn}
            onPress={() => {
              const v = (parseFloat(weight) || 0) + 0.1;
              setWeight(v.toFixed(1));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </Pressable>
        </View>
        {delta && (
          <View style={styles.deltaRow}>
            <Typography variant="mono" color={parseFloat(delta) <= 0 ? colors.success : colors.accent3}>
              {parseFloat(delta) > 0 ? '+' : ''}{delta} kg vs yesterday
            </Typography>
          </View>
        )}
      </Card>

      {/* Mood picker */}
      <Card>
        <Typography variant="label" color={colors.textMuted} style={{ marginBottom: spacing.md }}>
          TODAY'S MOOD
        </Typography>
        <View style={styles.moodRow}>
          {moods.map((m) => (
            <Pressable
              key={m.value}
              style={[styles.moodBtn, mood === m.value && styles.moodBtnSelected]}
              onPress={() => {
                setMood(m.value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Typography style={{ fontSize: 28 }}>{m.emoji}</Typography>
              <Typography variant="label" color={mood === m.value ? colors.accent : colors.textMuted}>
                {m.label}
              </Typography>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Optional measurements */}
      <Pressable onPress={() => setShowOptional((v) => !v)}>
        <View style={styles.optionalHeader}>
          <Typography variant="bodySemi" color={colors.textMuted}>Measurements (optional)</Typography>
          <Ionicons name={showOptional ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
        </View>
      </Pressable>

      {showOptional && (
        <Card>
          <View style={styles.measureRow}>
            <View style={styles.measureField}>
              <Typography variant="label" color={colors.textMuted}>WAIST (cm)</Typography>
              <TextInput
                style={styles.measureInput}
                value={waist}
                onChangeText={setWaist}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textDim}
              />
            </View>
            <View style={styles.measureField}>
              <Typography variant="label" color={colors.textMuted}>HIPS (cm)</Typography>
              <TextInput
                style={styles.measureInput}
                value={hips}
                onChangeText={setHips}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textDim}
              />
            </View>
          </View>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <Typography variant="label" color={colors.textMuted} style={{ marginBottom: spacing.sm }}>NOTES</Typography>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="How's the cut going today…"
          placeholderTextColor={colors.textDim}
          multiline
          numberOfLines={3}
        />
      </Card>

      {/* Save */}
      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Typography variant="bodySemi" color={colors.bg}>Save Body Log</Typography>
      </Pressable>
    </ScrollView>
  );
}

// ─── Nutrition Tab ────────────────────────────────────────────────────────────

function NutritionTab() {
  const date = todayString();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newMeal, setNewMeal] = useState({
    meal_name: '',
    description: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  });

  const loadMeals = useCallback(() => {
    setMeals(getMealsForDate(date));
  }, [date]);

  useEffect(() => { loadMeals(); }, []);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein_g: acc.protein_g + m.protein_g,
      carbs_g: acc.carbs_g + m.carbs_g,
      fat_g: acc.fat_g + m.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const remaining = TARGETS.calories - totals.calories;

  const handleAddMeal = () => {
    if (!newMeal.meal_name) return;
    insertMeal({
      date,
      meal_name: newMeal.meal_name,
      description: newMeal.description || null,
      calories: parseInt(newMeal.calories) || 0,
      protein_g: parseInt(newMeal.protein_g) || 0,
      carbs_g: parseInt(newMeal.carbs_g) || 0,
      fat_g: parseInt(newMeal.fat_g) || 0,
    });
    setNewMeal({ meal_name: '', description: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' });
    setShowAddSheet(false);
    loadMeals();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabScroll} showsVerticalScrollIndicator={false}>
      {/* Remaining banner */}
      <Card style={{ backgroundColor: remaining < 0 ? colors.accent3 + '20' : colors.surface }}>
        <Typography variant="label" color={colors.textMuted}>REMAINING TODAY</Typography>
        <Typography variant="displayM" color={remaining < 0 ? colors.accent3 : colors.accent}>
          {remaining < 0 ? '-' : ''}{Math.abs(remaining)} kcal
        </Typography>
        <Typography variant="bodyM" color={colors.textMuted}>
          {totals.calories} of {TARGETS.calories} kcal
        </Typography>
      </Card>

      {/* Macro dials */}
      <Card>
        <View style={styles.dialsRow}>
          <MacroDial
            label="Calories"
            current={totals.calories}
            target={TARGETS.calories}
            unit="kcal"
            accentColor={colors.accent3}
            size={76}
          />
          <MacroDial
            label="Protein"
            current={totals.protein_g}
            target={TARGETS.proteinG}
            unit="g"
            accentColor={colors.accent2}
            size={76}
          />
          <MacroDial
            label="Carbs"
            current={totals.carbs_g}
            target={TARGETS.carbsG}
            unit="g"
            accentColor={colors.accent}
            size={76}
          />
          <MacroDial
            label="Fat"
            current={totals.fat_g}
            target={TARGETS.fatG}
            unit="g"
            accentColor={colors.warning}
            size={76}
          />
        </View>
      </Card>

      {/* Meal list */}
      <Card>
        <View style={styles.sectionHeader}>
          <Typography variant="bodySemi" color={colors.text}>Meals</Typography>
          <Pressable onPress={() => setShowAddSheet(true)}>
            <View style={styles.addBtn}>
              <Ionicons name="add" size={16} color={colors.bg} />
              <Typography variant="label" color={colors.bg}>Add</Typography>
            </View>
          </Pressable>
        </View>
        {meals.length === 0 ? (
          <Typography variant="bodyM" color={colors.textMuted} style={{ paddingTop: spacing.sm }}>
            No meals logged yet.
          </Typography>
        ) : (
          meals.map((meal) => (
            <MealRow
              key={meal.id}
              meal={meal}
              onDelete={(id) => { deleteMeal(id); loadMeals(); }}
              onUpdate={() => loadMeals()}
            />
          ))
        )}
      </Card>

      {/* Add meal bottom sheet */}
      <BottomSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} height={480}>
        <Typography variant="displayS" color={colors.text} style={{ marginBottom: spacing.lg }}>
          Add Meal
        </Typography>
        <View style={styles.addMealForm}>
          {([
            { key: 'meal_name', label: 'Meal name', placeholder: 'Breakfast, Lunch…', keyboard: 'default' },
            { key: 'description', label: 'Description', placeholder: 'e.g. Chicken rice bowl', keyboard: 'default' },
            { key: 'calories', label: 'Calories (kcal)', placeholder: '0', keyboard: 'number-pad' },
            { key: 'protein_g', label: 'Protein (g)', placeholder: '0', keyboard: 'number-pad' },
            { key: 'carbs_g', label: 'Carbs (g)', placeholder: '0', keyboard: 'number-pad' },
            { key: 'fat_g', label: 'Fat (g)', placeholder: '0', keyboard: 'number-pad' },
          ] as const).map((f) => (
            <View key={f.key} style={styles.formField}>
              <Typography variant="label" color={colors.textMuted}>{f.label.toUpperCase()}</Typography>
              <TextInput
                style={styles.formInput}
                value={newMeal[f.key]}
                onChangeText={(v) => setNewMeal((prev) => ({ ...prev, [f.key]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor={colors.textDim}
                keyboardType={f.keyboard as any}
              />
            </View>
          ))}
          <Pressable style={styles.saveBtn} onPress={handleAddMeal}>
            <Typography variant="bodySemi" color={colors.bg}>Add Meal</Typography>
          </Pressable>
        </View>
      </BottomSheet>
    </ScrollView>
  );
}

// ─── Workout Tab ──────────────────────────────────────────────────────────────

function WorkoutTab() {
  const { session, loadTodaySession, startSession, saveSet, completeSet, finishSession } = useWorkoutStore();
  const [split, setSplit] = useState<SplitType>(() => {
    const dow = new Date().getDay();
    return WORKOUT_SCHEDULE[dow];
  });
  const [showRestTimer, setShowRestTimer] = useState(false);
  const startTime = useRef<number>(Date.now());

  useEffect(() => { loadTodaySession(); }, []);

  const exercises = EXERCISES[split];
  const splits: SplitType[] = ['push', 'pull', 'legs', 'upper', 'legs-core', 'cardio', 'rest'];

  const handleStartWorkout = () => {
    startSession(split);
    startTime.current = Date.now();
  };

  const handleFinish = () => {
    const mins = Math.round((Date.now() - startTime.current) / 60000);
    finishSession(mins);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabScroll} showsVerticalScrollIndicator={false}>
      {/* Split selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        <View style={styles.splitChips}>
          {splits.map((s) => (
            <Pressable
              key={s}
              style={[styles.chip, split === s && styles.chipActive]}
              onPress={() => setSplit(s)}
            >
              <Typography variant="label" color={split === s ? colors.bg : colors.textMuted}>
                {SPLIT_SHORT[s]}
              </Typography>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Split label */}
      <Typography variant="bodySemi" color={colors.text} style={{ marginBottom: spacing.md }}>
        {SPLIT_LABELS[split]}
      </Typography>

      {/* Cardio / Rest special screens */}
      {split === 'cardio' && (
        <Card>
          <Typography variant="displayS" color={colors.accent}>Zone 2 Cardio</Typography>
          <Typography variant="bodyM" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
            45 min treadmill, bike, or rowing{'\n'}Target: 110–120 BPM (60–65% max HR)
          </Typography>
        </Card>
      )}
      {split === 'rest' && (
        <Card>
          <Typography variant="displayS" color={colors.textMuted}>Rest Day</Typography>
          <Typography variant="bodyM" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
            Recovery. Light walking OK. No lifting.
          </Typography>
        </Card>
      )}

      {/* Exercises */}
      {exercises.length > 0 && (
        <>
          {!session && (
            <Pressable style={styles.saveBtn} onPress={handleStartWorkout}>
              <Typography variant="bodySemi" color={colors.bg}>Start Workout</Typography>
            </Pressable>
          )}

          {exercises.map((ex, i) => (
            <ExerciseRow
              key={ex.name}
              exercise={ex}
              index={i}
              onSetChange={(setNum, reps, weight) => {
                if (session) saveSet(ex.name, setNum, reps ? parseInt(reps) : null, weight ? parseFloat(weight) : null);
              }}
              onSetComplete={async (setNum, reps, weight) => {
                if (!session) return false;
                const isPr = await completeSet(ex.name, setNum, reps, weight);
                setShowRestTimer(true);
                return isPr;
              }}
            />
          ))}

          {session && (
            <Pressable style={[styles.saveBtn, { backgroundColor: colors.success }]} onPress={handleFinish}>
              <Typography variant="bodySemi" color={colors.bg}>Finish Workout</Typography>
            </Pressable>
          )}
        </>
      )}

      {/* Rest timer overlay */}
      {showRestTimer && (
        <Card style={styles.restTimerCard}>
          <RestTimer
            initialSeconds={90}
            onDone={() => setShowRestTimer(false)}
            onSkip={() => setShowRestTimer(false)}
          />
        </Card>
      )}
    </ScrollView>
  );
}

// ─── Main Log Screen ──────────────────────────────────────────────────────────

export default function LogScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('body');
  const { loadToday } = useLogStore();

  useEffect(() => { loadToday(); }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'body', label: 'Body' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'workout', label: 'Workout' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="displayS" color={colors.text}>Daily Log</Typography>
        <Typography variant="mono" color={colors.textMuted}>{todayString()}</Typography>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Typography
              variant="bodySemi"
              color={activeTab === tab.key ? colors.accent : colors.textMuted}
            >
              {tab.label}
            </Typography>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'body' && <BodyTab />}
      {activeTab === 'nutrition' && <NutritionTab />}
      {activeTab === 'workout' && <WorkoutTab />}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  tabBtnActive: {
    backgroundColor: colors.surface2,
  },
  tabContent: {
    flex: 1,
  },
  tabScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  weightCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  weightInputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  weightInput: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 52,
    color: colors.accent,
    minWidth: 110,
    textAlign: 'center',
  },
  deltaRow: {
    marginTop: spacing.xs,
  },
  moodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  moodBtnSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '15',
  },
  optionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  measureRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  measureField: {
    flex: 1,
    gap: spacing.xs,
  },
  measureInput: {
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 16,
    padding: spacing.sm,
    textAlign: 'center',
  },
  notesInput: {
    color: colors.text,
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  addMealForm: {
    gap: spacing.md,
  },
  formField: {
    gap: spacing.xs,
  },
  formInput: {
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    padding: spacing.sm,
  },
  splitChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  restTimerCard: {
    marginTop: spacing.md,
  },
});
