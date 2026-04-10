import { getDB } from './index';

export interface Meal {
  id: number;
  date: string;
  meal_name: string;
  description: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at: string;
}

export function getMealsForDate(date: string): Meal[] {
  const db = getDB();
  return db.getAllSync<Meal>('SELECT * FROM meals WHERE date = ? ORDER BY created_at', [date]);
}

export function insertMeal(meal: Omit<Meal, 'id' | 'created_at'>): number {
  const db = getDB();
  const result = db.runSync(
    `INSERT INTO meals (date, meal_name, description, calories, protein_g, carbs_g, fat_g)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [meal.date, meal.meal_name, meal.description ?? null, meal.calories, meal.protein_g, meal.carbs_g, meal.fat_g]
  );
  return result.lastInsertRowId;
}

export function updateMeal(id: number, meal: Partial<Omit<Meal, 'id' | 'created_at' | 'date'>>): void {
  const db = getDB();
  db.runSync(
    `UPDATE meals SET
       meal_name   = COALESCE(?, meal_name),
       description = COALESCE(?, description),
       calories    = COALESCE(?, calories),
       protein_g   = COALESCE(?, protein_g),
       carbs_g     = COALESCE(?, carbs_g),
       fat_g       = COALESCE(?, fat_g)
     WHERE id = ?`,
    [
      meal.meal_name ?? null,
      meal.description ?? null,
      meal.calories ?? null,
      meal.protein_g ?? null,
      meal.carbs_g ?? null,
      meal.fat_g ?? null,
      id,
    ]
  );
}

export function deleteMeal(id: number): void {
  const db = getDB();
  db.runSync('DELETE FROM meals WHERE id = ?', [id]);
}

export function getMacroTotalsForDate(date: string): { calories: number; protein_g: number; carbs_g: number; fat_g: number } {
  const db = getDB();
  const row = db.getFirstSync<{ calories: number; protein_g: number; carbs_g: number; fat_g: number }>(
    `SELECT
       COALESCE(SUM(calories), 0) as calories,
       COALESCE(SUM(protein_g), 0) as protein_g,
       COALESCE(SUM(carbs_g), 0) as carbs_g,
       COALESCE(SUM(fat_g), 0) as fat_g
     FROM meals WHERE date = ?`,
    [date]
  );
  return row ?? { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
}
