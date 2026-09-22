-- =============================================
-- MIGRATION: Add professional_start_date column to users table
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_start_date DATE;

-- Backfill: Convert existing years_of_experience to an approximate start date
-- (sets start date to Jan 1 of (current year - years_of_experience))
UPDATE users
SET professional_start_date = (
  DATE_TRUNC('year', CURRENT_DATE) - (years_of_experience::INTEGER || ' years')::INTERVAL
)::DATE
WHERE years_of_experience IS NOT NULL
  AND years_of_experience != ''
  AND professional_start_date IS NULL;

-- Confirm columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
