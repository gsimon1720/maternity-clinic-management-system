import { supabaseAdmin as supabase } from './src/config/supabase.js';

async function runMigration() {
  console.log('🔄 Setting up permissions tables via Supabase SQL...');

  // Try to create the tables via RPC (if exec_sql function exists)
  const ddl = `
    CREATE TABLE IF NOT EXISTS permissions (
        permission_id SERIAL PRIMARY KEY,
        permission_name VARCHAR(100) NOT NULL UNIQUE,
        module_name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
        is_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role, permission_id)
    );
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
  `;

  const rpcResult = await supabase.rpc('exec_sql', { sql_query: ddl });
  if (rpcResult.error) {
    console.warn('⚠️  RPC exec_sql not available or failed:', rpcResult.error.message);
    console.log('Proceeding to seed permissions directly (tables must already exist in Supabase)...');
  } else {
    console.log('✅ Tables created via RPC');
  }

  // Seed standard permissions
  const standardPermissions = [
    { permission_name: 'VIEW_CLINIC_INFO', module_name: 'Clinic Management', description: 'Allow viewing clinic profile and details' },
    { permission_name: 'EDIT_CLINIC_INFO', module_name: 'Clinic Management', description: 'Allow editing clinic profile information' },
    { permission_name: 'VIEW_STAFF', module_name: 'Staff Management', description: 'Allow viewing staff member list' },
    { permission_name: 'ADD_STAFF', module_name: 'Staff Management', description: 'Allow registering new staff members' },
    { permission_name: 'EDIT_STAFF', module_name: 'Staff Management', description: 'Allow updating staff member profiles' },
    { permission_name: 'DELETE_STAFF', module_name: 'Staff Management', description: 'Allow deactivating/deleting staff members' },
    { permission_name: 'VIEW_USERS', module_name: 'User Management', description: 'Allow viewing user roster' },
    { permission_name: 'EDIT_USERS', module_name: 'User Management', description: 'Allow editing user status and roles' },
    { permission_name: 'VIEW_REPORTS', module_name: 'Reports', description: 'Allow viewing system & operational reports' },
    { permission_name: 'EXPORT_REPORTS', module_name: 'Reports', description: 'Allow exporting report documents as PDF' },
    { permission_name: 'ACCESS_PATIENTS', module_name: 'Patients', description: 'Allow access to patient records module' },
    { permission_name: 'CREATE_PATIENTS', module_name: 'Patients', description: 'Allow registering new patient profiles' },
    { permission_name: 'EDIT_PATIENTS', module_name: 'Patients', description: 'Allow editing existing patient details' },
    { permission_name: 'DELETE_PATIENTS', module_name: 'Patients', description: 'Allow deactivating/deleting patient records' },
    { permission_name: 'VIEW_APPOINTMENTS', module_name: 'Appointments', description: 'Allow viewing scheduled appointments' },
    { permission_name: 'MANAGE_APPOINTMENTS', module_name: 'Appointments', description: 'Allow scheduling and editing appointments' }
  ];

  console.log('📋 Seeding standard permissions...');
  let seeded = 0;
  for (const perm of standardPermissions) {
    const { data: existing, error: chkErr } = await supabase
      .from('permissions')
      .select('permission_id')
      .eq('permission_name', perm.permission_name)
      .maybeSingle();

    if (chkErr) {
      console.error(`  ❌ Error checking permission ${perm.permission_name}:`, chkErr.message);
      continue;
    }

    if (!existing) {
      const { error: insErr } = await supabase.from('permissions').insert([perm]);
      if (insErr) {
        console.error(`  ❌ Error inserting ${perm.permission_name}:`, insErr.message);
      } else {
        console.log(`  ✅ Seeded: ${perm.permission_name}`);
        seeded++;
      }
    } else {
      console.log(`  ⏭️  Already exists: ${perm.permission_name}`);
    }
  }
  console.log(`  → ${seeded} new permissions added.`);

  // Seed role_permissions for CLINIC_ADMIN (all enabled by default)
  const { data: allPerms, error: fetchErr } = await supabase.from('permissions').select('permission_id');
  if (fetchErr) {
    console.error('❌ Failed to fetch permissions:', fetchErr.message);
    return;
  }

  console.log(`\n🔐 Seeding role_permissions for CLINIC_ADMIN (${allPerms.length} permissions)...`);
  let rpSeeded = 0;
  for (const p of allPerms) {
    const { data: existing } = await supabase
      .from('role_permissions')
      .select('id')
      .eq('role', 'CLINIC_ADMIN')
      .eq('permission_id', p.permission_id)
      .maybeSingle();

    if (!existing) {
      const { error: rpErr } = await supabase.from('role_permissions').insert([{
        role: 'CLINIC_ADMIN',
        permission_id: p.permission_id,
        is_enabled: true
      }]);
      if (!rpErr) rpSeeded++;
    }
  }
  console.log(`  → ${rpSeeded} new role_permissions entries added.`);

  console.log('\n✅ Permissions setup completed!');
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
