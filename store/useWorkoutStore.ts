import { create } from 'zustand';
import {
  createSession,
  getTodaySession,
  getSessionSets,
  upsertExerciseSet,
  markSetCompleted,
  updateSessionCompleted,
  getPersonalRecord,
  upsertPersonalRecord,
  WorkoutSession,
  ExerciseSet,
} from '../db/workouts';
import { SplitType } from '../constants/workouts';
import { todayString } from '../constants/targets';

interface WorkoutState {
  session: WorkoutSession | null;
  sets: ExerciseSet[];
  restTimerActive: boolean;
  restTimerSeconds: number;
  loadTodaySession: () => void;
  startSession: (splitType: SplitType) => void;
  saveSet: (exerciseName: string, setNumber: number, reps: number | null, weightKg: number | null) => void;
  completeSet: (exerciseName: string, setNumber: number, reps: number, weightKg: number) => Promise<boolean>;
  finishSession: (durationMin: number) => void;
  startRestTimer: (seconds: number) => void;
  clearRestTimer: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  session: null,
  sets: [],
  restTimerActive: false,
  restTimerSeconds: 90,

  loadTodaySession() {
    const date = todayString();
    const session = getTodaySession(date);
    const sets = session ? getSessionSets(session.id) : [];
    set({ session, sets });
  },

  startSession(splitType) {
    const date = todayString();
    let session = getTodaySession(date);
    if (!session) {
      const id = createSession(date, splitType);
      session = getTodaySession(date);
    }
    const sets = session ? getSessionSets(session.id) : [];
    set({ session, sets });
  },

  saveSet(exerciseName, setNumber, reps, weightKg) {
    const { session } = get();
    if (!session) return;
    upsertExerciseSet(session.id, exerciseName, setNumber, reps, weightKg);
    const sets = getSessionSets(session.id);
    set({ sets });
  },

  async completeSet(exerciseName, setNumber, reps, weightKg) {
    const { session } = get();
    if (!session) return false;

    // Check PR
    const pr = getPersonalRecord(exerciseName);
    const isPr = !pr || weightKg > pr.weight_kg;

    // Upsert and mark complete
    const setId = upsertExerciseSet(session.id, exerciseName, setNumber, reps, weightKg);
    markSetCompleted(setId, isPr);

    if (isPr) {
      upsertPersonalRecord(exerciseName, weightKg, reps, todayString());
    }

    const sets = getSessionSets(session.id);
    set({ sets });
    return isPr;
  },

  finishSession(durationMin) {
    const { session } = get();
    if (!session) return;
    updateSessionCompleted(session.id, true, durationMin);
    const updated = getTodaySession(todayString());
    set({ session: updated });
  },

  startRestTimer(seconds) {
    set({ restTimerActive: true, restTimerSeconds: seconds });
  },

  clearRestTimer() {
    set({ restTimerActive: false });
  },
}));
