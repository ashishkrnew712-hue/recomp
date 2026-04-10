import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../constants/colors';
import { Typography } from '../shared/Typography';
import { spacing } from '../../constants/spacing';

interface TripleRingProps {
  fatLossProgress: number;   // 0–1
  calorieProgress: number;   // 0–1
  proteinProgress: number;   // 0–1
  size?: number;
}

function Ring({
  progress,
  radius,
  strokeWidth,
  color,
  cx,
  cy,
}: {
  progress: number;
  radius: number;
  strokeWidth: number;
  color: string;
  cx: number;
  cy: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));
  return (
    <>
      <Circle cx={cx} cy={cy} r={radius} stroke={color + '22'} strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${cx}, ${cy}`}
      />
    </>
  );
}

export function TripleRing({ fatLossProgress, calorieProgress, proteinProgress, size = 140 }: TripleRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const sw = 10;
  const gap = 14;
  const r1 = (size - sw) / 2;
  const r2 = r1 - sw - gap;
  const r3 = r2 - sw - gap;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Ring progress={fatLossProgress}  radius={r1} strokeWidth={sw} color={colors.accent3} cx={cx} cy={cy} />
        <Ring progress={calorieProgress}  radius={r2} strokeWidth={sw} color={colors.accent}  cx={cx} cy={cy} />
        <Ring progress={proteinProgress}  radius={r3} strokeWidth={sw} color={colors.accent2} cx={cx} cy={cy} />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.center]}>
        <Typography variant="monoSemi" color={colors.text}>
          {Math.round(fatLossProgress * 100)}%
        </Typography>
        <Typography variant="label" color={colors.textMuted}>done</Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
