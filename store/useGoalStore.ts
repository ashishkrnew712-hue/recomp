import { create } from 'zustand';
import { getSetting, setSetting } from '../db';
import { TARGETS } from '../constants/targets';

interface Goals {
  targetWeightKg: number;
  startWeightKg: number;
  targetBfp: number;
  startBfp: number;
  dailyCalories: number;
  dailyProteinG: number;
  dailyCarbsG: number;
  dailyFatG: number;
  heightCm: number;
  age: number;
  gender: string;
  startDate: string;
}

interface GoalState {
  goals: Goals;
  loadGoals: () => void;
  updateGoal: (key: keyof Goals, value: string | number) => void;
}

function loadFromDB(): Goals {
  return {
    targetWeightKg: parseFloat(getSetting('target_weight_kg') ?? String(TARGETS.targetWeightKg)),
    startWeightKg:  parseFloat(getSetting('start_weight_kg')  ?? String(TARGETS.startWeightKg)),
    targetBfp:      parseFloat(getSetting('target_bfp')       ?? String(TARGETS.targetBfp)),
    startBfp:       parseFloat(getSetting('start_bfp')        ?? String(TARGETS.startBfp)),
    dailyCalories:  parseInt(getSetting('daily_calories')      ?? String(TARGETS.calories)),
    dailyProteinG:  parseInt(getSetting('daily_protein_g')     ?? String(TARGETS.proteinG)),
    dailyCarbsG:    parseInt(getSetting('daily_carbs_g')       ?? String(TARGETS.carbsG)),
    dailyFatG:      parseInt(getSetting('daily_fat_g')         ?? String(TARGETS.fatG)),
    heightCm:       parseInt(getSetting('height_cm')           ?? String(TARGETS.heightCm)),
    age:            parseInt(getSetting('age')                 ?? String(TARGETS.age)),
    gender:         getSetting('gender')                        ?? TARGETS.gender,
    startDate:      getSetting('start_date')                    ?? TARGETS.startDate,
  };
}

const DB_KEY_MAP: Record<keyof Goals, string> = {
  targetWeightKg: 'target_weight_kg',
  startWeightKg:  'start_weight_kg',
  targetBfp:      'target_bfp',
  startBfp:       'start_bfp',
  dailyCalories:  'daily_calories',
  dailyProteinG:  'daily_protein_g',
  dailyCarbsG:    'daily_carbs_g',
  dailyFatG:      'daily_fat_g',
  heightCm:       'height_cm',
  age:            'age',
  gender:         'gender',
  startDate:      'start_date',
};

export const useGoalStore = create<GoalState>((set) => ({
  goals: {
    targetWeightKg: TARGETS.targetWeightKg,
    startWeightKg:  TARGETS.startWeightKg,
    targetBfp:      TARGETS.targetBfp,
    startBfp:       TARGETS.startBfp,
    dailyCalories:  TARGETS.calories,
    dailyProteinG:  TARGETS.proteinG,
    dailyCarbsG:    TARGETS.carbsG,
    dailyFatG:      TARGETS.fatG,
    heightCm:       TARGETS.heightCm,
    age:            TARGETS.age,
    gender:         TARGETS.gender,
    startDate:      TARGETS.startDate,
  },

  loadGoals() {
    try {
      set({ goals: loadFromDB() });
    } catch {
      // DB not ready yet — use defaults
    }
  },

  updateGoal(key, value) {
    setSetting(DB_KEY_MAP[key], String(value));
    set((state) => ({ goals: { ...state.goals, [key]: value } }));
  },
}));
