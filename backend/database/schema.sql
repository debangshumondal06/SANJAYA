PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL COLLATE NOCASE,
  department TEXT NOT NULL,
  access_role TEXT NOT NULL DEFAULT 'duty_officer',
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS duplicate_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  centre_latitude REAL NOT NULL,
  centre_longitude REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK (category IN ('pothole', 'garbage_overflow', 'waterlogging')),
  description TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  ward TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  priority_score INTEGER NOT NULL CHECK (priority_score BETWEEN 0 AND 100),
  priority_label TEXT NOT NULL,
  priority_explanation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'reopened')),
  department_id INTEGER,
  duplicate_group_id INTEGER,
  evidence_filename TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (duplicate_group_id) REFERENCES duplicate_groups(id)
);

CREATE TABLE IF NOT EXISTS incident_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id INTEGER NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_members_lookup ON members(member_id, display_name, is_active);
CREATE INDEX IF NOT EXISTS idx_incidents_queue ON incidents(status, priority_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_department ON incidents(department_id);
CREATE INDEX IF NOT EXISTS idx_updates_incident ON incident_updates(incident_id, created_at DESC);