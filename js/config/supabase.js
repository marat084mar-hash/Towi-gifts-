import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase-js.esm.js';

const supabaseUrl = 'https://kkgjkqiwrppaszvkeqbe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2prcWl3cnJwYXN6dmtlcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDI5MDksImV4cCI6MjA4NjMxODkwOX0.euUijEzkXldhHFbIuZuzePn2ppwON78Ub-MPLKm5a9Y';

export const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Начало выполнения supabase.js');

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase-js.esm.js';
console.log('Импорт createClient выполнен');

const supabaseUrl = 'https://kkgjkqiwrppaszvkeqbe.supabase.co';
const supabaseKey = '...'; // ваш ключ

console.log('Создание клиента Supabase...');
export const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Экспорт supabase выполнен');
