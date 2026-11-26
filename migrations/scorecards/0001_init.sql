-- Scorecard submissions (KB-157). D1 databases: hci-scorecards (production), hci-scorecards-dev (dev).
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  scorecard TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  marketing_consent INTEGER NOT NULL DEFAULT 0,
  call_requested INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL,
  band TEXT NOT NULL,
  categories_json TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  qualifying_json TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  emailed INTEGER NOT NULL DEFAULT 0,
  email_error TEXT
);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions (created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_ip ON submissions (ip_hash, created_at);
