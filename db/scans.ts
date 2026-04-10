import { getDB } from './index';

export interface BodyScan {
  id: number;
  scan_date: string;
  weight_kg: number | null;
  bfp: number | null;
  smm_kg: number | null;
  fat_mass_kg: number | null;
  lean_mass_kg: number | null;
  bmi: number | null;
  whr: number | null;
  visceral_fat: number | null;
  metabolic_age: number | null;
  bmr: number | null;
  notes: string | null;
  created_at: string;
}

export function getAllScans(): BodyScan[] {
  const db = getDB();
  return db.getAllSync<BodyScan>('SELECT * FROM body_scans ORDER BY scan_date DESC');
}

export function getLatestScan(): BodyScan | null {
  const db = getDB();
  return db.getFirstSync<BodyScan>('SELECT * FROM body_scans ORDER BY scan_date DESC LIMIT 1') ?? null;
}

export function insertScan(scan: Omit<BodyScan, 'id' | 'created_at'>): void {
  const db = getDB();
  db.runSync(
    `INSERT INTO body_scans
      (scan_date, weight_kg, bfp, smm_kg, fat_mass_kg, lean_mass_kg, bmi, whr, visceral_fat, metabolic_age, bmr, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      scan.scan_date,
      scan.weight_kg ?? null,
      scan.bfp ?? null,
      scan.smm_kg ?? null,
      scan.fat_mass_kg ?? null,
      scan.lean_mass_kg ?? null,
      scan.bmi ?? null,
      scan.whr ?? null,
      scan.visceral_fat ?? null,
      scan.metabolic_age ?? null,
      scan.bmr ?? null,
      scan.notes ?? null,
    ]
  );
}
