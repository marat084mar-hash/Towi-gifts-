// УДАЛИТЬ эту строку! createClient теперь доступен через глобальный объект 'supabase'
// import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://kkgjkqiwrppaszvkeqbe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2prcWl3cnJwYXN6dmtlcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDI5MDksImV4cCI6MjA4NjMxODkwOX0.euUijEzkXldhHFbIuZuzePn2ppcON78Ub-MPLKm5a9Y';

// Создаем клиент Supabase, используя ГЛОБАЛЬНЫЙ объект 'supabase', который предоставляет CDN
// Убедитесь, что строка `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
// стоит ПЕРЕД этим скриптом в ваших HTML-файлах.
window.supabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase initialized:", !!window.supabase);
