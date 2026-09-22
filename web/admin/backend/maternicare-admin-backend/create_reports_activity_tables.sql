-- ==========================================================
-- MIGRATION: Create user_activity_logs and user_status_history tables
-- Run this script in your Supabase Dashboard > SQL Editor
-- ==========================================================

-- 1. Create user_activity_logs table for session and login activity reporting
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    login_time TIMESTAMPTZ DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    session_duration_minutes INTEGER DEFAULT 0,
    ip_address VARCHAR(45),
    device_info TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);

-- 2. Create user_status_history table for status audit and change history reporting
CREATE TABLE IF NOT EXISTS user_status_history (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by BIGINT REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_status_history_user_id ON user_status_history(user_id);

-- 3. Seed historical login activity records for existing users
DO $$
DECLARE
    user_rec RECORD;
    i INT;
    random_days INT;
    random_duration INT;
    login_ts TIMESTAMPTZ;
BEGIN
    FOR user_rec IN SELECT user_id, created_at, last_login, status FROM users WHERE role IN ('DOCTOR', 'NURSE', 'MIDWIFE', 'CLINIC_ADMIN') LOOP
        -- Seed 5-15 logs for active users, 1-3 for inactive ones
        FOR i IN 1..(CASE WHEN user_rec.status = 'active' THEN 10 ELSE 2 END) LOOP
            random_days := (user_rec.user_id * i * 3) % 45; -- logs spread up to 45 days ago
            login_ts := NOW() - (random_days || ' days')::INTERVAL - ((i * 4) || ' hours')::INTERVAL;
            random_duration := 15 + ((user_rec.user_id * i * 7) % 65); -- session duration 15 to 80 mins
            
            INSERT INTO user_activity_logs (user_id, login_time, logout_time, session_duration_minutes, ip_address, device_info)
            VALUES (
                user_rec.user_id,
                login_ts,
                login_ts + (random_duration || ' minutes')::INTERVAL,
                random_duration,
                '192.168.1.' || (100 + (user_rec.user_id % 150)),
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
            );
        END LOOP;

        -- Seed status history
        INSERT INTO user_status_history (user_id, previous_status, new_status, changed_at)
        VALUES (
            user_rec.user_id,
            CASE WHEN user_rec.status = 'active' THEN 'inactive' ELSE 'active' END,
            user_rec.status,
            COALESCE(user_rec.last_login, NOW()) - INTERVAL '10 days'
        );
    END LOOP;
END $$;
