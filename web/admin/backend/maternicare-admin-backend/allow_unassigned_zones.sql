-- =============================================
-- MIGRATION: Allow standalone (unassigned) Zones
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- Zones can now exist without an Area (area_id NULL) — created by the
-- Administrative Division Officer before being grouped into an Area.
ALTER TABLE zones ALTER COLUMN area_id DROP NOT NULL;

-- Deleting an Area should release its Zones back to the unassigned pool
-- instead of deleting them (was previously ON DELETE CASCADE).
ALTER TABLE zones DROP CONSTRAINT IF EXISTS zones_area_id_fkey;
ALTER TABLE zones ADD CONSTRAINT zones_area_id_fkey
  FOREIGN KEY (area_id) REFERENCES areas(area_id) ON DELETE SET NULL;

-- Needed for the Area Management table's "Created Date" / "Status" columns.
ALTER TABLE areas ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE areas ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
