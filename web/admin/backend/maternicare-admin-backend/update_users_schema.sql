-- =============================================
-- MIGRATION: Add professional & qualification columns to users table
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS qualifications TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS qualification_doc TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_experience VARCHAR(50);

-- Confirm columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
