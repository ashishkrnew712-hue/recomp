import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../shared/Typography';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import * as Haptics from 'expo-haptics';

interface RestTimerProps {
  initialSeconds: number;
  onDone: () => void;
  onSkip: () => void;
}

export function RestTimer({ initialSeconds, onDone, onSkip }: RestTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onDone();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const add30 = () => setSeconds((s) => s + 30);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <View style={styles.container}>
      <Typography variant="label" color={colors.textMuted} style={styles.restLabel}>
        REST
      </Typography>
      <Typography variant="displayM" color={colors.accent}>
        {mins}:{String(secs).padStart(2, '0')}
      </Typography>
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={add30}>
          <Typography variant="bodySemi" color={colors.text}>+30s</Typography>
        </Pressable>
        <Pressable style={[styles.btn, styles.skipBtn]} onPress={onSkip}>
          <Typography variant="bodySemi" color={colors.textMuted}>Skip</Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  restLabel: {
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  btn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipBtn: {
    borderColor: colors.textDim,
  },
});
