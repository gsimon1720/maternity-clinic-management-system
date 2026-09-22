import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract the project ref from the URL
// e.g. https://swfgrhrupcpggtwycalm.supabase.co -> swfgrhrupcpggtwycalm
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

const sql = `
-- 1. permissions table
CREATE TABLE IF NOT EXISTS permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    module_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. role_permissions table (Super Admin -> Clinic Admin control)
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission_id)
);

-- 3. clinic_staff_permissions table (Clinic Admin -> Staff control)
CREATE TABLE IF NOT EXISTS clinic_staff_permissions (
    id SERIAL PRIMARY KEY,
    clinic_id INT REFERENCES clinics(clinic_id) ON DELETE CASCADE,
    staff_role VARCHAR(50) NOT NULL,
    permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id, staff_role, permission_id)
);

-- Insert standard system permissions grouped by module
INSERT INTO permissions (permission_name, module_name, description) VALUES
('VIEW_CLINIC_INFO', 'Clinic Management', 'Allow viewing clinic profile and details'),
('EDIT_CLINIC_INFO', 'Clinic Management', 'Allow editing clinic profile information'),
('VIEW_STAFF', 'Staff Management', 'Allow viewing staff member list'),
('ADD_STAFF', 'Staff Management', 'Allow registering new staff members'),
('EDIT_STAFF', 'Staff Management', 'Allow updating staff member profiles'),
('DELETE_STAFF', 'Staff Management', 'Allow deactivating/deleting staff members'),
('VIEW_USERS', 'User Management', 'Allow viewing user roster'),
('EDIT_USERS', 'User Management', 'Allow editing user status and roles'),
('VIEW_REPORTS', 'Reports', 'Allow viewing system and operational reports'),
('EXPORT_REPORTS', 'Reports', 'Allow exporting report documents as PDF'),
('ACCESS_PATIENTS', 'Patients', 'Allow access to patient records module'),
('CREATE_PATIENTS', 'Patients', 'Allow registering new patient profiles'),
('EDIT_PATIENTS', 'Patients', 'Allow editing existing patient details'),
('DELETE_PATIENTS', 'Patients', 'Allow deactivating/deleting patient records'),
('VIEW_APPOINTMENTS', 'Appointments', 'Allow viewing scheduled appointments'),
('MANAGE_APPOINTMENTS', 'Appointments', 'Allow scheduling and editing appointments')
ON CONFLICT (permission_name) DO NOTHING;

-- Seed default CLINIC_ADMIN role_permissions as ENABLED
INSERT INTO role_permissions (role, permission_id, is_enabled)
SELECT 'CLINIC_ADMIN', permission_id, TRUE FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;
`;

async function runSQL() {
  console.log('🚀 Executing SQL via Supabase Management API...');
  console.log(`📍 Project: ${projectRef}`);

  const res = await fetch(managementApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('❌ Management API error:', res.status, JSON.stringify(data, null, 2));

    // Fallback: try the direct Supabase SQL via the /rest/v1/rpc approach
    console.log('\n🔄 Trying pg endpoint fallback...');
    await fallbackPg();
    return;
  }

  console.log('✅ SQL executed successfully via Management API!');
  console.log(JSON.stringify(data, null, 2));
}

async function fallbackPg() {
  // Try the pg endpoint which is available on some Supabase setups
  const pgUrl = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  const res = await fetch(pgUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ sql_query: sql }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('❌ Fallback also failed:', res.status, err.substring(0, 500));
    console.log('\n📋 MANUAL STEP REQUIRED:');
    console.log('Please run the SQL in create_permissions_tables.sql manually in your Supabase Dashboard:');
    console.log(`  → ${SUPABASE_URL.replace('.supabase.co', '')}.supabase.co → SQL Editor`);
    return;
  }

  const data = await res.json();
  console.log('✅ SQL executed via fallback!', data);
}

runSQL().catch(err => {
  console.error('💥 Fatal error:', err.message);
});
