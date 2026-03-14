import { supabase } from '../config/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('.nav-button[data-page]');
    const backButtons = document.querySelectorAll('.back-to-main, .back-btn');
    const modal = document.getElementById('add-balance-modal');
    const openModalBtn = document.getElementById('add-balance-btn');
    const closeModalBtn = document.querySelector('.modal-close-btn');

    // Функция перехода
    function navigateTo(pageId) {
        pages.forEach(p => p.classList.remove('active'));
        const target = document.getElementById(pageId);
        if(target) target.classList.add('active');
    }

    // Клики по кнопкам меню
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });

    // Кнопки назад
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => navigateTo('page-main'));
    });

    // Модальное окно
    openModalBtn.onclick = () => modal.classList.add('visible');
    closeModalBtn.onclick = () => modal.classList.remove('visible');
    window.onclick = (event) => { if (event.target == modal) modal.classList.remove('visible'); }

    // Проверка Supabase (логин через Telegram ID)
    async function initApp() {
        const tg = window.Telegram.WebApp;
        tg.expand();
        const user = tg.initDataUnsafe?.user || { id: 12345, username: 'LocalUser' }; // Заглушка для ПК

        document.getElementById('user-nickname').textContent = @${user.username || user.first_name};
        
        // Попытка получить данные из Supabase
        const { data, error } = await supabase.from('users').select('*').eq('user_id', user.id).single();
        if (data) {
            document.getElementById('balance').textContent = ${data.balance.toFixed(2)} TON;
            if(data.avatar_url) document.getElementById('user-avatar').src = data.avatar_url;
        } else {
            console.error("Ошибка Supabase или юзер не найден:", error);
        }
    }
    initApp();
});
