// Ждем, пока вся HTML-структура страницы будет готова
document.addEventListener('DOMContentLoaded', () => {
    
    console.log('DOM полностью загружен. Запускаю все скрипты...');

    /*=============== ПОКАЗ МЕНЮ ===============*/
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            if (navMenu) navMenu.classList.add('show-menu');
        });
    }

    if (navClose) {
        navClose.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('show-menu');
        });
    }

    /*=============== ТЕМНАЯ/СВЕТЛАЯ ТЕМА ===============*/
    const themeButton = document.getElementById('theme-button');
    if (themeButton) {
        const darkTheme = 'dark-theme';
        const iconTheme = 'ri-sun-line';

        const selectedTheme = localStorage.getItem('selected-theme');
        const selectedIcon = localStorage.getItem('selected-icon');

        const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
        const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line';

        if (selectedTheme) {
            document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
            themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme);
        }

        themeButton.addEventListener('click', () => {
            document.body.classList.toggle(darkTheme);
            themeButton.classList.toggle(iconTheme);
            localStorage.setItem('selected-theme', getCurrentTheme());
            localStorage.setItem('selected-icon', getCurrentIcon());
        });
    }

    /*=============== TELEGRAM & APP LOGIC ===============*/
    const tg = window.Telegram ? window.Telegram.WebApp : null;

    if (tg && tg.initData) {
        document.getElementById('app-container')?.style.display = 'block';
        document.getElementById('non-telegram-placeholder')?.style.display = 'none';
        
        tg.ready();
        tg.expand();
        console.log("Приложение запущено в Telegram.");

    } else {
        document.getElementById('app-container')?.style.display = 'none';
        document.getElementById('non-telegram-placeholder')?.style.display = 'block';
        console.warn("Приложение запущено вне Telegram. Показываю заглушку.");
    }

    console.log('Скрипт global.v2.js успешно выполнен.');
});
