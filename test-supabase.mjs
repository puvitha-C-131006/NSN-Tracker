import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgmaakxlhybzycijvhvb.supabase.co';
const supabaseAnonKey = 'sb_publishable_ERAh8lFCwuQjNGS7IqqFtA_ohgYX5z2';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const tryCol = async (col) => {
    const { error } = await supabase.from('employees').select(col).limit(1);
    console.log(`Column ${col} -> Error:`, error?.message || 'None');
  };

  const cols = [
    'role', 'type', 'nokia_lwd', 'nokia_doj', 'resignation_applied', 'nokia_lm',
    'attrition_type', 'attrition_reason', 'laptop_assigned', 'business_group'
  ];

  for (let c of cols) {
    await tryCol(c);
  }
}
test();
