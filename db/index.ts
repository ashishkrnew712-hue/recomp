import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, SEED_BODY_SCANS, SEED_SETTINGS } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;

export function getDB(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync('recomp.db');
  }
  return _db;
}

export async function initDB(): Promise<void> {
  const db = getDB();

  // Split statements and execute each one
  const statements = CREATE_TABLES
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    db.execSync(stmt + ';');
  }

  // Seed settings
  const settingStmts = SEED_SETTINGS
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of settingStmts) {
    db.execSync(stmt + ';');
  }

  // Seed body scans — only if table is empty to avoid duplicate detection issues
  const existing = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM body_scans');
  if (!existing || existing.count === 0) {
    const scanStmts = SEED_BODY_SCANS
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of scanStmts) {
      try { db.execSync(stmt + ';'); } catch { /* ignore duplicate */ }
    }
  }
}

export function getSetting(key: string): string | null {
  const db = getDB();
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const db = getDB();
  db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}
