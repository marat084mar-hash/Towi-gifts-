import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkgjkqiwrppaszvkeqbe.supabase.co'; // замените на ваш URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2prcWl3cnBwYXN6dmtlcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDI5MDksImV4cCI6MjA4NjMxODkwOX0.euUijEzkXldhHFbIuZuzePn2ppwON78Ub-MPLKm5a9Y'; // замените на ваш anon_key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
