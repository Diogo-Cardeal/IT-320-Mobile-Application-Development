import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://xtecsfnfzsvpzfdjkstd.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_PD4Kii2jeFqOvMnBaggXlA_nvMxyCV2';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
