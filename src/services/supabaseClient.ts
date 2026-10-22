import { createClient } from '@supabase/supabase-js';

// Salin URL dan Anon Key persis dari popup kamu sebagai nilai cadangan (fallback)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ewjrznpcoifsyvloimpq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'PASTE_ANON_KEY_LENGKAP_DI_SINI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
