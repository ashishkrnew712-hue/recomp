import { create } from 'zustand';
import { getStreak } from '../db/logs';

interface StreakState {
  streak: number;
  refresh: () => void;
}

export const useStreakStore = create<StreakState>((set) => ({
  streak: 0,
  refresh() {
    try {
      set({ streak: getStreak() });
    } catch {
      // DB may not be initialized yet
    }
  },
}));
