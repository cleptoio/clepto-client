-- ============================================
-- FIX DATABASE SCHEMA TO MATCH CODE EXPECTATIONS
-- ============================================

-- 1. Add missing columns to workflow_executions
ALTER TABLE workflow_executions
  ADD COLUMN IF NOT EXISTS start_time timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS end_time timestamp with time zone,
  ADD COLUMN IF NOT EXISTS input_tokens integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS output_tokens integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS model_used text;

-- 2. Migrate existing data (if any exists)
UPDATE workflow_executions
SET
  start_time = executed_at,
  end_time = executed_at + (duration_ms || ' milliseconds')::interval,
  input_tokens = COALESCE(tokens_used / 2, 0),
  output_tokens = COALESCE(tokens_used / 2, 0),
  model_used = ai_model
WHERE start_time IS NULL;

-- 3. Add missing status column to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status = ANY (ARRAY['active'::text, 'in_planning'::text, 'completed'::text, 'on_hold'::text]));

-- 4. Add missing budget column to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS budget numeric(10,2);

-- 5. Fix support_tickets - rename title to subject
ALTER TABLE support_tickets
  RENAME COLUMN title TO subject;

-- 6. Add missing columns to sub_processors
ALTER TABLE sub_processors
  ADD COLUMN IF NOT EXISTS purpose text;

-- 7. Add missing columns to dpa_signatures
ALTER TABLE dpa_signatures
  ADD COLUMN IF NOT EXISTS signer_name text,
  ADD COLUMN IF NOT EXISTS signer_email text;

-- Update version to be non-null with default
UPDATE dpa_signatures SET version = 'v2.1' WHERE version IS NULL;
ALTER TABLE dpa_signatures ALTER COLUMN version SET NOT NULL;

-- 8. Add missing industry column to clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS industry text;
