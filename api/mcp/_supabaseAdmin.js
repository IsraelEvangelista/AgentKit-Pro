import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Missing SUPABASE_URL (or VITE_SUPABASE_URL)');
  }
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
};

export default getSupabaseAdmin;

