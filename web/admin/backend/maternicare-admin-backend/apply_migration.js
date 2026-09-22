import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swfgrhrupcpggtwycalm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZmdyaHJ1cGNwZ2d0d3ljYWxtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mzk5MjAxMCwiZXhwIjoyMDk5NTY4MDEwfQ.FX7kY6O-1DmL_O0RPfH32ASE2rs-dc8K1hDjS2_qWtc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Testing column insertion/update in Supabase users table...');
  const { data: users, error: selError } = await supabase.from('users').select('*').limit(1);
  if (selError) {
    console.error('Select error:', selError);
    process.exit(1);
  }
  if (users.length > 0) {
    const userId = users[0].user_id;
    console.log('Found user ID:', userId);
    // Test update with license_number, qualifications, qualification_doc, specialization, years_of_experience
    const { data: updated, error: updError } = await supabase
      .from('users')
      .update({
        license_number: users[0].license_number || null,
        specialization: users[0].specialization || null,
        qualifications: users[0].qualifications || null,
        qualification_doc: users[0].qualification_doc || null,
        years_of_experience: users[0].years_of_experience || null
      })
      .eq('user_id', userId)
      .select();
    
    if (updError) {
      console.log('Update error:', updError.message);
    } else {
      console.log('Success! Columns exist in users table.');
    }
  }
  process.exit(0);
}

applyMigration();
