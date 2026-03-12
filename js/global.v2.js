// Импортируем createClient из CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- КОНФИГУРАЦИЯ ---
const SUPABASE_URL = 'https://bgxazpvmixyblutkpubk.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneGF6cHZtaXh5Ymx1dGtwdWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM3OTg1NjcsImV4cCI6MjAyOTM3NDU2N30.C2D5T22f2X-p-aIfeHlR_1o5c2Hl5qCGw3S04yDwa44';

// --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---

// Инициализируем клиент Supabase и делаем его доступным глобально
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Инициализируем Telegram Web App
const tg = window.Telegram.WebApp;

// --- ОСНОВНАЯ ЛОГИКА ---

// Проверяем, запущено ли приложение в Telegram
if (tg && tg.initData) {
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.style.display = 'block';
    }
    
    tg.ready();
    tg.expand();
    console.log("App script (global.v2.js): Telegram WebApp is ready.");

    // Здесь можно будет добавить логику для юзера, баланса и т.д.
    
} else {
    // Показываем заглушку, если открыто в обычном браузере
    const placeholder = document.getElementById('non-telegram-placeholder');
    if (placeholder) {
        placeholder.style.display = 'block';
    }
    console.warn("App script (global.v2.js): Not in Telegram, showing placeholder.");
}
