import { pool } from './db.js';

const migration = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL, description text NOT NULL DEFAULT '', position integer NOT NULL,
  kind text NOT NULL DEFAULT 'checkin' CHECK (kind IN ('registration','checkin','submission')),
  deleted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(campaign_id, position)
);
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL, student_id text NOT NULL, phone text NOT NULL, school text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(campaign_id, student_id), UNIQUE(campaign_id, phone)
);
CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), stage_id uuid NOT NULL REFERENCES stages(id),
  participant_id uuid NOT NULL REFERENCES participants(id), source text NOT NULL DEFAULT 'web',
  device text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(stage_id, participant_id)
);
CREATE INDEX IF NOT EXISTS idx_stages_campaign ON stages(campaign_id, position) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checkins_stage ON checkins(stage_id);
`;

export async function migrate() { await pool.query(migration); }
if (process.argv[1]?.endsWith('migrate.js')) migrate().then(() => pool.end());
