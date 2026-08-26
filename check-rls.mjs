import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgmaakxlhybzycijvhvb.supabase.co';
const supabaseAnonKey = 'sb_publishable_ERAh8lFCwuQjNGS7IqqFtA_ohgYX5z2';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase
    .from('pg_class')
    .select('*')
    .limit(1);
    
  console.log('pg_class error:', error?.message);
}
check();
