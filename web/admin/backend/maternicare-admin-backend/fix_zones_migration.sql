-- =============================================
-- MIGRATION: Fix zones table - add area_id FK
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- Step 1: Drop and recreate zones table with correct schema
DROP TABLE IF EXISTS zones CASCADE;

CREATE TABLE zones (
  zone_id   BIGSERIAL PRIMARY KEY,
  area_id   BIGINT NOT NULL REFERENCES areas(area_id) ON DELETE CASCADE,
  zone_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Confirm columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'zones'
ORDER BY ordinal_position;
