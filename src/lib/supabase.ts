
import { createClient } from '@supabase/supabase-js';

// Use placeholder values if environment variables are not set
// This allows the app to at least load in development environments
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Still log a warning if real credentials are missing
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase URL or Anon Key. Using placeholder values. The app will load but Supabase features will not work correctly. Please set the environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
