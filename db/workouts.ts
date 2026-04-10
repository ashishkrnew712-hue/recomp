import { getDB } from './index';
import { SplitType } from '../constants/workouts';

export interface WorkoutSession {
  id: number;
  date: string;
  split_type: SplitType;
  duration_min: number | null;
  notes: string | null;
  completed: number;
  created_at: string;
}

export interface ExerciseSet {
  id: number;
  session_id: number;
  exercise_name: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  completed: number;
  is_pr: number;
  created_at: string;
}

export function getTodaySession(date: string): WorkoutSession | null {
  const db = getDB();
  return db.getFirstSync<WorkoutSession>(
    'SELECT * FROM workout_sessions WHERE date = ? ORDER BY id DESC LIMIT 1',
    [date]
  ) ?? null;
}

export function createSession(date: string, splitType: SplitType): number {
  const db = getDB();
  const result = db.runSync(
    'INSERT INTO workout_sessions (date, split_type) VALUES (?, ?)',
    [date, splitType]
  );
  return result.lastInsertRowId;
}

export function updateSessionCompleted(sessionId: number, completed: boolean, durationMin?: number): void {
  const db = getDB();
  db.runSync(
    'UPDATE workout_sessions SET completed = ?, duration_min = COALESCE(?, duration_min) WHERE id = ?',
    [completed ? 1 : 0, durationMin ?? null, sessionId]
  );
}

export function upsertExerciseSet(
  sessionId: number,
  exerciseName: string,
  setNumber: number,
  reps: number | null,
  weightKg: number | null
): number {
  const db = getDB();
  const existing = db.getFirstSync<ExerciseSet>(
    'SELECT * FROM exercise_sets WHERE session_id = ? AND exercise_name = ? AND set_number = ?',
    [sessionId, exerciseName, setNumber]
  );

  if (existing) {
    db.runSync(
      'UPDATE exercise_sets SET reps = ?, weight_kg = ? WHERE id = ?',
      [reps, weightKg, existing.id]
    );
    return existing.id;
  } else {
    const result = db.runSync(
      'INSERT INTO exercise_sets (session_id, exercise_name, set_number, reps, weight_kg) VALUES (?, ?, ?, ?, ?)',
      [sessionId, exerciseName, setNumber, reps, weightKg]
    );
    return result.lastInsertRowId;
  }
}

export function markSetCompleted(setId: number, isPr: boolean): void {
  const db = getDB();
  db.runSync(
    'UPDATE exercise_sets SET completed = 1, is_pr = ? WHERE id = ?',
    [isPr ? 1 : 0, setId]
  );
}

export function getSessionSets(sessionId: number): ExerciseSet[] {
  const db = getDB();
  return db.getAllSync<ExerciseSet>(
    'SELECT * FROM exercise_sets WHERE session_id = ? ORDER BY exercise_name, set_number',
    [sessionId]
  );
}

export function getPersonalRecord(exerciseName: string): { weight_kg: number; reps: number } | null {
  const db = getDB();
  return db.getFirstSync<{ weight_kg: number; reps: number }>(
    'SELECT weight_kg, reps FROM personal_records WHERE exercise_name = ?',
    [exerciseName]
  ) ?? null;
}

export function upsertPersonalRecord(exerciseName: string, weightKg: number, reps: number, date: string): void {
  const db = getDB();
  db.runSync(
    `INSERT INTO personal_records (exercise_name, weight_kg, reps, achieved_date)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(exercise_name) DO UPDATE SET
       weight_kg = excluded.weight_kg,
       reps = excluded.reps,
       achieved_date = excluded.achieved_date
     WHERE excluded.weight_kg > personal_records.weight_kg`,
    [exerciseName, weightKg, reps, date]
  );
}

export function getRecentSessions(days: number): WorkoutSession[] {
  const db = getDB();
  return db.getAllSync<WorkoutSession>(
    'SELECT * FROM workout_sessions ORDER BY date DESC LIMIT ?',
    [days]
  );
}
