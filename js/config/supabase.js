import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://kkgjkqiwrppaszvkeqbe.supabase.co';
const SUPABASE_ANNON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2prcWl3cnBwYXN6dmtlcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDI5MDksImV4cCI6MjA4NjMxODkwOX0.euUijEzkXldhHFbIuZuzePn2ppwON78Ub-MPLKm5a9Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANNON_KEY);

console.log("Supabase client initialized.");
