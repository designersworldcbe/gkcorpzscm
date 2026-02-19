
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Access environment variables safely
const getEnv = (key: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key] || '';
    }
    return '';
  } catch {
    return '';
  }
};

// Use the URL and Key provided by the user as defaults to ensure connectivity
const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://wqvxvkxultqsejotxgxq.supabase.co';

// Fallback to the specific key provided by the user if env is missing
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 
                        getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
                        getEnv('SUPABASE_KEY') || 
                        'sb_publishable_fVEkfI_SSnugHQkkDd8tKQ_xMZnUfGo';

// We only initialize if we have a key to prevent "supabaseKey is required" error.
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseAnonKey !== '') 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase configuration missing. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your environment.");
}
