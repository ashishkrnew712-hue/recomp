import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../shared/Typography';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { Exercise } from '../../constants/workouts';

interface SetData {
  reps: string;
  weight: string;
  completed: boolean;
  isPr: boolean;
}

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  onSetComplete: (setNumber: number, reps: number, weight: number) => Promise<boolean>;
  onSetChange: (setNumber: number, reps: string, weight: string) => void;
}

export function ExerciseRow({ exercise, index, onSetComplete, onSetChange }: ExerciseRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [sets, setSets] = useState<SetData[]>(
    Array.from({ length: exercise.defaultSets }, () => ({
      reps: String(exercise.defaultReps),
      weight: '',
      completed: false,
      isPr: false,
    }))
  );

  const allDone = sets.every((s) => s.completed);

  const handleComplete = async (setIdx: number) => {
    const set = sets[setIdx];
    const reps = parseInt(set.reps) || 0;
    const weight = parseFloat(set.weight) || 0;
    const isPr = await onSetComplete(setIdx + 1, reps, weight);
    setSets((prev) =>
      prev.map((s, i) => (i === setIdx ? { ...s, completed: true, isPr } : s))
    );
  };

  return (
    <View style={[styles.container, allDone && styles.done]}>
      <Pressable style={styles.header} onPress={() => setExpanded((e) => !e)}>
        <View style={styles.indexBadge}>
          <Typography variant="monoSemi" color={allDone ? colors.success : colors.accent}>
            {String(index + 1).padStart(2, '0')}
          </Typography>
        </View>
        <View style={styles.titleArea}>
          <Typography variant="bodySemi" color={allDone ? colors.success : colors.text}>
            {exercise.name}
          </Typography>
          <Typography variant="label" color={colors.textMuted}>
            {exercise.defaultSets} × {exercise.defaultReps} {exercise.type === 'compound' ? '· compound' : exercise.type === 'core' ? '· core' : '· isolation'}
          </Typography>
        </View>
        {allDone && (
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        )}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </Pressable>

      {expanded && (
        <View style={styles.setsContainer}>
          <View style={styles.setHeader}>
            <Typography variant="label" color={colors.textMuted} style={{ width: 30 }}>SET</Typography>
            <Typography variant="label" color={colors.textMuted} style={{ flex: 1 }}>REPS</Typography>
            <Typography variant="label" color={colors.textMuted} style={{ flex: 1 }}>KG</Typography>
            <View style={{ width: 36 }} />
          </View>
          {sets.map((set, setIdx) => (
            <View key={setIdx} style={[styles.setRow, set.completed && styles.completedRow]}>
              <View style={styles.setBadge}>
                <Typography variant="monoSemi" color={set.completed ? colors.success : colors.textMuted}>
                  {setIdx + 1}
                </Typography>
              </View>
              <TextInput
                style={[styles.input, set.completed && styles.inputDone]}
                value={set.reps}
                onChangeText={(v) => {
                  const updated = sets.map((s, i) => i === setIdx ? { ...s, reps: v } : s);
                  setSets(updated);
                  onSetChange(setIdx + 1, v, set.weight);
                }}
                keyboardType="number-pad"
                placeholder={String(exercise.defaultReps)}
                placeholderTextColor={colors.textDim}
                editable={!set.completed}
              />
              <TextInput
                style={[styles.input, set.completed && styles.inputDone]}
                value={set.weight}
                onChangeText={(v) => {
                  const updated = sets.map((s, i) => i === setIdx ? { ...s, weight: v } : s);
                  setSets(updated);
                  onSetChange(setIdx + 1, set.reps, v);
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textDim}
                editable={!set.completed}
              />
              {set.completed ? (
                <View style={styles.checkArea}>
                  {set.isPr && (
                    <Typography variant="label" color={colors.accent} style={styles.prBadge}>PR</Typography>
                  )}
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                </View>
              ) : (
                <Pressable style={styles.doneBtn} onPress={() => handleComplete(setIdx)}>
                  <Ionicons name="checkmark" size={18} color={colors.bg} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  done: {
    borderColor: colors.success + '40',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  setsContainer: {
    backgroundColor: colors.surface2,
    padding: spacing.md,
    gap: spacing.sm,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  completedRow: {
    opacity: 0.6,
  },
  setBadge: {
    width: 30,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  inputDone: {
    borderColor: colors.success + '40',
    color: colors.success,
  },
  doneBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkArea: {
    width: 36,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  prBadge: {
    backgroundColor: colors.accent + '30',
    paddingHorizontal: 3,
    borderRadius: 3,
    textAlign: 'center',
  },
});
