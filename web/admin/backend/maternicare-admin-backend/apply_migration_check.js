import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swfgrhrupcpggtwycalm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZmdyaHJ1cGNwZ2d0d3ljYWxtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mzk5MjAxMCwiZXhwIjoyMDk5NTY4MDEwfQ.FX7kY6O-1DmL_O0RPfH32ASE2rs-dc8K1hDjS2_qWtc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: users, error } = await supabase.from('users').select('*').limit(1);
  if (users && users.length > 0) {
    const user = users[0];
    console.log('Existing columns on user:', Object.keys(user));
  }
  process.exit(0);
}

check();
