// Правильный путь для импорта Supabase JS из CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://kkgjkqiwrppaszvkeqbe.supabase.co';
// Исправлено: использование supabaseKey, а не supabaseAnonKey
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2prcWl3cnJwYXN6dmtlcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDI5MDksImV4cCI6MjA4NjMxODkwOX0.euUijEzkXldhHFbIuZuzePn2ppcON78Ub-MPLKm5a9Y';

// Создаем клиент Supabase и делаем его доступным глобально через window.supabase
window.supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase initialized:", !!window.supabase);
