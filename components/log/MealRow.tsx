import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../shared/Typography';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { Meal } from '../../db/meals';

interface MealRowProps {
  meal: Meal;
  onDelete: (id: number) => void;
  onUpdate: (id: number, field: Partial<Meal>) => void;
}

export function MealRow({ meal, onDelete, onUpdate }: MealRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Typography variant="bodySemi" color={colors.text}>{meal.meal_name}</Typography>
        {meal.description ? (
          <Typography variant="bodyM" color={colors.textMuted}>{meal.description}</Typography>
        ) : null}
        <View style={styles.macros}>
          <Typography variant="mono" color={colors.accent3}>{meal.calories} kcal</Typography>
          <Typography variant="mono" color={colors.textMuted}> · </Typography>
          <Typography variant="mono" color={colors.accent2}>{meal.protein_g}g P</Typography>
          <Typography variant="mono" color={colors.textMuted}> · </Typography>
          <Typography variant="mono" color={colors.warning}>{meal.fat_g}g F</Typography>
        </View>
      </View>
      <Pressable onPress={() => onDelete(meal.id)} hitSlop={8}>
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  macros: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
