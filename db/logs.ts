import { getDB } from './index';

export interface DailyLog {
  id: number;
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  mood: number | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function getTodayLog(date: string): DailyLog | null {
  const db = getDB();
  return db.getFirstSync<DailyLog>('SELECT * FROM daily_logs WHERE date = ?', [date]) ?? null;
}

export function upsertLog(log: Partial<DailyLog> & { date: string }): void {
  const db = getDB();
  const existing = getTodayLog(log.date);

  if (existing) {
    db.runSync(
      `UPDATE daily_logs SET
        weight_kg = COALESCE(?, weight_kg),
        waist_cm  = COALESCE(?, waist_cm),
        hips_cm   = COALESCE(?, hips_cm),
        mood      = COALESCE(?, mood),
        calories  = COALESCE(?, calories),
        protein_g = COALESCE(?, protein_g),
        carbs_g   = COALESCE(?, carbs_g),
        fat_g     = COALESCE(?, fat_g),
        notes     = COALESCE(?, notes),
        updated_at = datetime('now')
      WHERE date = ?`,
      [
        log.weight_kg ?? null,
        log.waist_cm ?? null,
        log.hips_cm ?? null,
        log.mood ?? null,
        log.calories ?? null,
        log.protein_g ?? null,
        log.carbs_g ?? null,
        log.fat_g ?? null,
        log.notes ?? null,
        log.date,
      ]
    );
  } else {
    db.runSync(
      `INSERT INTO daily_logs (date, weight_kg, waist_cm, hips_cm, mood, calories, protein_g, carbs_g, fat_g, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        log.date,
        log.weight_kg ?? null,
        log.waist_cm ?? null,
        log.hips_cm ?? null,
        log.mood ?? null,
        log.calories ?? 0,
        log.protein_g ?? 0,
        log.carbs_g ?? 0,
        log.fat_g ?? 0,
        log.notes ?? null,
      ]
    );
  }
}

export function getRecentLogs(days: number): DailyLog[] {
  const db = getDB();
  return db.getAllSync<DailyLog>(
    'SELECT * FROM daily_logs ORDER BY date DESC LIMIT ?',
    [days]
  );
}

export function getAllLogs(): DailyLog[] {
  const db = getDB();
  return db.getAllSync<DailyLog>('SELECT * FROM daily_logs ORDER BY date DESC');
}

export function getStreak(): number {
  const db = getDB();
  const logs = db.getAllSync<{ date: string }>('SELECT date FROM daily_logs ORDER BY date DESC');
  if (logs.length === 0) return 0;

  const today = new Date();
  let streak = 0;
  let cursor = new Date(today);

  for (const log of logs) {
    const logDate = new Date(log.date);
    const diff = Math.round((cursor.getTime() - logDate.getTime()) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      cursor = logDate;
    } else {
      break;
    }
  }
  return streak;
}
