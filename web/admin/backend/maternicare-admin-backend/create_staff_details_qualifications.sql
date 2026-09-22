-- =============================================
-- MIGRATION: Create staff_details_qualifications table
-- Run this script in your Supabase Dashboard > SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS staff_details_qualifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    professional_start_date DATE,
    qualification_title TEXT NOT NULL,
    document_url TEXT,
    document_path TEXT,
    uploaded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast retrieval of qualifications by staff user_id
CREATE INDEX IF NOT EXISTS idx_staff_qualifications_user_id 
ON staff_details_qualifications(user_id);

-- Optional: Populate initial records from existing users table columns if present
INSERT INTO staff_details_qualifications (user_id, license_number, professional_start_date, qualification_title, document_url, document_path)
SELECT 
    user_id, 
    license_number, 
    professional_start_date, 
    COALESCE(NULLIF(qualifications, ''), 'Professional Qualification'), 
    qualification_doc,
    NULL
FROM users
WHERE (qualifications IS NOT NULL AND qualifications != '')
   OR (qualification_doc IS NOT NULL AND qualification_doc != '')
   OR (license_number IS NOT NULL AND license_number != '')
   OR (professional_start_date IS NOT NULL);

-- Confirm table creation
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'staff_details_qualifications'
ORDER BY ordinal_position;
