// Ashish's personal recomposition targets
export const TARGETS = {
  // Body
  startWeightKg:  77.1,
  targetWeightKg: 64.2,
  startBfp:       29.3,
  targetBfp:      15.0,
  startDate:      '2026-03-13',
  leanMassKg:     54.6,
  heightCm:       170,
  age:            39,
  gender:         'male' as const,

  // Daily nutrition
  calories:  1850,
  proteinG:  160,
  carbsG:    160,
  fatG:      55,
  tdee:      2400,
  deficit:   550,

  // Refeed (every 7th day)
  refeedCalories: 2200,
  refeedProteinG: 160,

  // Cardio target
  cardioMinutes: 45,
  cardioHrLow:   110,
  cardioHrHigh:  120,

  // Pace
  weeklyLossKgLow:  0.5,
  weeklyLossKgHigh: 0.75,
} as const;

export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round(Math.abs(b - a) / 86400000);
}

export function estimateBfp(currentWeightKg: number): number {
  // Simple estimate: fat mass = start fat mass - (start weight - current weight)
  // start fat mass = 22.5 kg
  const fatLost = TARGETS.startWeightKg - currentWeightKg;
  const currentFatMass = Math.max(22.5 - fatLost * 0.85, 0);
  return (currentFatMass / currentWeightKg) * 100;
}

export function missionProgress(currentWeightKg: number): number {
  const total = TARGETS.startWeightKg - TARGETS.targetWeightKg;
  const done  = TARGETS.startWeightKg - currentWeightKg;
  return Math.min(Math.max(done / total, 0), 1);
}
