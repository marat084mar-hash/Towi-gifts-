// Импортируем createClient из CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- КОНФИГУРАЦИЯ ---
// !!! ВАЖНО: Убедись, что эти данные верны !!!
const SUPABASE_URL = 'https://bgxazpvmixyblutkpubk.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneGF6cHZtaXh5Ymx1dGtwdWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM3OTg1NjcsImV4cCI6MjAyOTM3NDU2N30.C2D5T22f2X-p-aIfeHlR_1o5c2Hl5qCGw3S04yDwa44';

// --- ГЛОБАЛЬНЫЕ ОБЪЕКТЫ ---

// Инициализируем клиент Supabase и делаем его доступным глобально
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Инициализируем Telegram Web App и делаем его доступным глобально
window.tg = window.Telegram.WebApp;

// --- ОСНОВНАЯ ЛОГИКА ДЛЯ ВСЕХ СТРАНИЦ ---

// Эта функция сработает, как только загрузится основная структура страницы
document.addEventListener('DOMContentLoaded', () => {
    // Показываем основное содержимое только если открыто в Telegram
    if (window.tg && window.tg.initData) {
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.style.display = 'block';
        }
        
        window.tg.ready();
        window.tg.expand();
        console.log("Приложение запущено в Telegram.");

    } else {
        // Показываем заглушку, если открыто в обычном браузере
        const placeholder = document.getElementById('non-telegram-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
        }
        console.warn("Приложение запущено вне Telegram. Будет показана заглушка.");
    }

    /*=============== ПОКАЗ МЕНЮ ===============*/
    const navMenu = document.getElementById('nav-menu'),
          navToggle = document.getElementById('nav-toggle'),
          navClose = document.getElementById('nav-close')

    if(navToggle){
        navToggle.addEventListener('click', () =>{
            navMenu.classList.add('show-menu')
        })
    }
    if(navClose){
        navClose.addEventListener('click', () =>{
            navMenu.classList.remove('show-menu')
        })
    }
});
