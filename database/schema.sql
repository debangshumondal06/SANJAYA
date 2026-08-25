PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT NOT NULL UNIQUE CHECK (length(trim(member_id)) BETWEEN 4 AND 32),
  display_name TEXT NOT NULL COLLATE NOCASE CHECK (length(trim(display_name)) BETWEEN 2 AND 120),
  department TEXT NOT NULL,
  access_role TEXT NOT NULL DEFAULT 'duty_officer',
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_members_lookup
  ON members (member_id, display_name, is_active);
