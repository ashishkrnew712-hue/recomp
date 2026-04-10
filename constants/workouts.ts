export type SplitType = 'push' | 'pull' | 'legs' | 'upper' | 'legs-core' | 'cardio' | 'rest';

export const WORKOUT_SCHEDULE: Record<number, SplitType> = {
  1: 'push',       // Monday
  2: 'pull',       // Tuesday
  3: 'legs',       // Wednesday
  4: 'cardio',     // Thursday
  5: 'upper',      // Friday
  6: 'legs-core',  // Saturday
  0: 'rest',       // Sunday
};

export interface Exercise {
  name: string;
  type: 'compound' | 'isolation' | 'core';
  defaultSets: number;
  defaultReps: number;
}

export const EXERCISES: Record<SplitType, Exercise[]> = {
  push: [
    { name: 'Barbell Bench Press',    type: 'compound',  defaultSets: 4, defaultReps: 6 },
    { name: 'Incline Dumbbell Press', type: 'compound',  defaultSets: 4, defaultReps: 8 },
    { name: 'Cable Chest Fly',        type: 'isolation', defaultSets: 3, defaultReps: 12 },
    { name: 'Overhead Press',         type: 'compound',  defaultSets: 4, defaultReps: 6 },
    { name: 'Lateral Raises',         type: 'isolation', defaultSets: 3, defaultReps: 15 },
    { name: 'Tricep Rope Pushdown',   type: 'isolation', defaultSets: 3, defaultReps: 12 },
  ],
  pull: [
    { name: 'Deadlift',               type: 'compound',  defaultSets: 4, defaultReps: 6 },
    { name: 'Bent Over Barbell Row',  type: 'compound',  defaultSets: 4, defaultReps: 8 },
    { name: 'Pull-Ups / Lat Pulldown',type: 'compound',  defaultSets: 4, defaultReps: 8 },
    { name: 'Seated Cable Row',       type: 'compound',  defaultSets: 3, defaultReps: 12 },
    { name: 'Face Pulls',             type: 'isolation', defaultSets: 3, defaultReps: 15 },
    { name: 'Barbell Curl',           type: 'isolation', defaultSets: 3, defaultReps: 12 },
  ],
  legs: [
    { name: 'Barbell Back Squat',     type: 'compound',  defaultSets: 4, defaultReps: 6 },
    { name: 'Romanian Deadlift',      type: 'compound',  defaultSets: 4, defaultReps: 8 },
    { name: 'Leg Press',              type: 'compound',  defaultSets: 3, defaultReps: 10 },
    { name: 'Walking Lunges',         type: 'compound',  defaultSets: 3, defaultReps: 12 },
    { name: 'Leg Curl (Machine)',      type: 'isolation', defaultSets: 3, defaultReps: 12 },
    { name: 'Calf Raises',            type: 'isolation', defaultSets: 4, defaultReps: 15 },
  ],
  upper: [
    { name: 'Flat Dumbbell Bench Press',  type: 'compound',  defaultSets: 4, defaultReps: 8 },
    { name: 'Single Arm DB Row',          type: 'compound',  defaultSets: 4, defaultReps: 8 },
    { name: 'Arnold Press',               type: 'compound',  defaultSets: 3, defaultReps: 10 },
    { name: 'Cable Row (Wide Grip)',       type: 'compound',  defaultSets: 3, defaultReps: 12 },
    { name: 'Incline Dumbbell Curl',      type: 'isolation', defaultSets: 3, defaultReps: 12 },
    { name: 'Overhead Tricep Extension',  type: 'isolation', defaultSets: 3, defaultReps: 12 },
  ],
  'legs-core': [
    { name: 'Front / Goblet Squat',   type: 'compound',  defaultSets: 4, defaultReps: 8 },
    { name: 'Sumo Deadlift',          type: 'compound',  defaultSets: 4, defaultReps: 6 },
    { name: 'Step-Ups (Weighted)',    type: 'compound',  defaultSets: 3, defaultReps: 12 },
    { name: 'Hip Thrust',             type: 'compound',  defaultSets: 3, defaultReps: 12 },
    { name: 'Hanging Leg Raises',     type: 'core',      defaultSets: 3, defaultReps: 15 },
    { name: 'Cable Woodchop / Plank', type: 'core',      defaultSets: 3, defaultReps: 15 },
  ],
  cardio: [],
  rest: [],
};

export const SPLIT_LABELS: Record<SplitType, string> = {
  push:        'Push Day — Chest, Shoulders & Triceps',
  pull:        'Pull Day — Back & Biceps',
  legs:        'Leg Day — Quads, Hamstrings & Glutes',
  upper:       'Upper Body Compound',
  'legs-core': 'Legs + Core',
  cardio:      'Zone 2 Cardio — 45 min @ 110–120 BPM',
  rest:        'Rest Day — Recovery',
};

export const SPLIT_SHORT: Record<SplitType, string> = {
  push:        'Push',
  pull:        'Pull',
  legs:        'Legs',
  upper:       'Upper',
  'legs-core': 'Legs+Core',
  cardio:      'Cardio',
  rest:        'Rest',
};
