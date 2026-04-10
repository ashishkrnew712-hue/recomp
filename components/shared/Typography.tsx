import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

type Variant = keyof typeof typography;

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: string;
}

export function Typography({ variant = 'bodyM', color, style, children, ...props }: TypographyProps) {
  return (
    <Text
      style={[typography[variant] as any, { color: color ?? colors.text }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
