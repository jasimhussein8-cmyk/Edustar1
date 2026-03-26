import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyjjsgtetypfotjxxpex.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_H4n9i-06KJoEguur1XYwYw_UqC9FgkU';

let _supabase: any = null;

const getSupabase = () => {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseKey) {
      // Return a dummy object that throws on use, but doesn't crash on initialization
      return new Proxy({}, {
        get() {
          throw new Error('Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_ equivalents) in your environment.');
        }
      });
    }
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
};

export const SUPABASE_BUCKET = 'files';

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    return getSupabase()[prop];
  }
});
