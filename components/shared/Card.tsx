import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated, style, children, ...props }: CardProps) {
  return (
    <View
      style={[styles.card, elevated && styles.elevated, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.surface2,
  },
});
