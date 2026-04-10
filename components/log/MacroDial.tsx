import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Typography } from '../shared/Typography';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

interface MacroDialProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  accentColor?: string;
  size?: number;
}

export function MacroDial({
  label,
  current,
  target,
  unit = 'g',
  accentColor = colors.accent,
  size = 80,
}: MacroDialProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / (target || 1), 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={6}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accentColor}
          strokeWidth={6}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.center]}>
        <Typography variant="monoSemi" color={colors.text}>
          {current}
        </Typography>
        <Typography variant="label" color={colors.textMuted}>
          {unit}
        </Typography>
      </View>
      <Typography variant="label" color={colors.textMuted} style={styles.label}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
