export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS daily_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT UNIQUE NOT NULL,
    weight_kg   REAL,
    waist_cm    REAL,
    hips_cm     REAL,
    mood        INTEGER,
    calories    INTEGER DEFAULT 0,
    protein_g   INTEGER DEFAULT 0,
    carbs_g     INTEGER DEFAULT 0,
    fat_g       INTEGER DEFAULT 0,
    notes       TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workout_sessions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    date         TEXT NOT NULL,
    split_type   TEXT NOT NULL,
    duration_min INTEGER,
    notes        TEXT,
    completed    INTEGER DEFAULT 0,
    created_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exercise_sets (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id    INTEGER NOT NULL REFERENCES workout_sessions(id),
    exercise_name TEXT NOT NULL,
    set_number    INTEGER NOT NULL,
    reps          INTEGER,
    weight_kg     REAL,
    completed     INTEGER DEFAULT 0,
    is_pr         INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meals (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    date         TEXT NOT NULL,
    meal_name    TEXT NOT NULL,
    description  TEXT,
    calories     INTEGER DEFAULT 0,
    protein_g    INTEGER DEFAULT 0,
    carbs_g      INTEGER DEFAULT 0,
    fat_g        INTEGER DEFAULT 0,
    created_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS body_scans (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_date     TEXT NOT NULL,
    weight_kg     REAL,
    bfp           REAL,
    smm_kg        REAL,
    fat_mass_kg   REAL,
    lean_mass_kg  REAL,
    bmi           REAL,
    whr           REAL,
    visceral_fat  INTEGER,
    metabolic_age INTEGER,
    bmr           INTEGER,
    notes         TEXT,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS personal_records (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_name TEXT NOT NULL,
    weight_kg     REAL NOT NULL,
    reps          INTEGER,
    achieved_date TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now')),
    UNIQUE(exercise_name)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

export const SEED_SETTINGS = `
  INSERT OR IGNORE INTO settings VALUES ('target_weight_kg', '64.2');
  INSERT OR IGNORE INTO settings VALUES ('start_weight_kg', '77.1');
  INSERT OR IGNORE INTO settings VALUES ('target_bfp', '15');
  INSERT OR IGNORE INTO settings VALUES ('start_bfp', '29.3');
  INSERT OR IGNORE INTO settings VALUES ('daily_calories', '1850');
  INSERT OR IGNORE INTO settings VALUES ('daily_protein_g', '160');
  INSERT OR IGNORE INTO settings VALUES ('daily_carbs_g', '160');
  INSERT OR IGNORE INTO settings VALUES ('daily_fat_g', '55');
  INSERT OR IGNORE INTO settings VALUES ('height_cm', '170');
  INSERT OR IGNORE INTO settings VALUES ('age', '39');
  INSERT OR IGNORE INTO settings VALUES ('gender', 'male');
  INSERT OR IGNORE INTO settings VALUES ('start_date', '2026-03-13');
`;

export const SEED_BODY_SCANS = `
  INSERT OR IGNORE INTO body_scans
    (scan_date, weight_kg, bfp, smm_kg, fat_mass_kg, lean_mass_kg, bmi, whr, visceral_fat, metabolic_age, bmr)
  VALUES
    ('2024-04-19', 80.4, 35.1, 49.1, null, null, null, null, null, null, null),
    ('2026-01-31', 79.4, 33.8, 50.9, null, null, null, null, null, null, null),
    ('2026-03-13', 77.1, 29.3, 31.0, 22.5, 54.6, 26.7, 0.97, 8, 38, 1558);
`;
