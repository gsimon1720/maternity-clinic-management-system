import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swfgrhrupcpggtwycalm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZmdyaHJ1cGNwZ2d0d3ljYWxtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mzk5MjAxMCwiZXhwIjoyMDk5NTY4MDEwfQ.FX7kY6O-1DmL_O0RPfH32ASE2rs-dc8K1hDjS2_qWtc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStorage() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  console.log('Buckets:', buckets, 'Error:', error);

  // Try creating a bucket for qualifications if it doesn't exist
  const { data: createData, error: createError } = await supabase.storage.createBucket('qualifications', { public: true });
  console.log('Create Bucket:', createData, 'Error:', createError);

  process.exit(0);
}

testStorage();
