// Fonts loaded via expo-google-fonts:
// Syne_700Bold, Syne_800ExtraBold  → headings, numbers, display
// InstrumentSans_400Regular, InstrumentSans_600SemiBold → body, labels
// JetBrainsMono_400Regular, JetBrainsMono_600SemiBold  → data, metrics

export const typography = {
  displayXL:  { fontFamily: 'Syne_800ExtraBold',         fontSize: 56, lineHeight: 60 },
  displayL:   { fontFamily: 'Syne_800ExtraBold',         fontSize: 40, lineHeight: 44 },
  displayM:   { fontFamily: 'Syne_700Bold',               fontSize: 28, lineHeight: 34 },
  displayS:   { fontFamily: 'Syne_700Bold',               fontSize: 22, lineHeight: 28 },
  bodyL:      { fontFamily: 'InstrumentSans_400Regular',  fontSize: 16, lineHeight: 24 },
  bodyM:      { fontFamily: 'InstrumentSans_400Regular',  fontSize: 14, lineHeight: 20 },
  bodySemi:   { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 14, lineHeight: 20 },
  label:      { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 11, letterSpacing: 1.5, lineHeight: 16 },
  mono:       { fontFamily: 'JetBrainsMono_400Regular',   fontSize: 13, lineHeight: 18 },
  monoSemi:   { fontFamily: 'JetBrainsMono_600SemiBold',  fontSize: 13, lineHeight: 18 },
} as const;
