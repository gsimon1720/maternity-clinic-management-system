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
-- Clinic Management Module
('VIEW_CLINIC_INFO', 'Clinic Management', 'Allow viewing clinic profile and details'),
('EDIT_CLINIC_INFO', 'Clinic Management', 'Allow editing clinic profile information'),

-- Staff Management Module
('VIEW_STAFF', 'Staff Management', 'Allow viewing staff member list'),
('ADD_STAFF', 'Staff Management', 'Allow registering new staff members'),
('EDIT_STAFF', 'Staff Management', 'Allow updating staff member profiles'),
('DELETE_STAFF', 'Staff Management', 'Allow deactivating/deleting staff members'),

-- Reports Module
('VIEW_REPORTS', 'Reports', 'Allow viewing system & operational reports'),
('EXPORT_REPORTS', 'Reports', 'Allow exporting report documents as PDF'),

-- Patients Module
('ACCESS_PATIENTS', 'Patients', 'Allow access to patient records module'),
('CREATE_PATIENTS', 'Patients', 'Allow registering new patient profiles'),
('EDIT_PATIENTS', 'Patients', 'Allow editing existing patient details'),
('DELETE_PATIENTS', 'Patients', 'Allow deactivating/deleting patient records'),

-- Appointments Module
('VIEW_APPOINTMENTS', 'Appointments', 'Allow viewing scheduled appointments'),
('MANAGE_APPOINTMENTS', 'Appointments', 'Allow scheduling and editing appointments')
ON CONFLICT (permission_name) DO NOTHING;

-- Seed default CLINIC_ADMIN role_permissions as ENABLED for all permissions initially
INSERT INTO role_permissions (role, permission_id, is_enabled)
SELECT 'CLINIC_ADMIN', permission_id, TRUE FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;
