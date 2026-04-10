import { create } from 'zustand';
import { getTodayLog, upsertLog, DailyLog } from '../db/logs';
import { getMacroTotalsForDate } from '../db/meals';
import { todayString } from '../constants/targets';

interface LogState {
  date: string;
  log: DailyLog | null;
  mealMacros: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
  loadToday: () => void;
  saveField: (field: Partial<DailyLog>) => void;
}

export const useLogStore = create<LogState>((set, get) => ({
  date: todayString(),
  log: null,
  mealMacros: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },

  loadToday() {
    const date = todayString();
    const log = getTodayLog(date);
    const mealMacros = getMacroTotalsForDate(date);
    set({ date, log, mealMacros });
  },

  saveField(fields) {
    const { date } = get();
    upsertLog({ date, ...fields });
    const log = getTodayLog(date);
    set({ log });
  },
}));
