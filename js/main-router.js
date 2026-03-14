// Импортируем функции, которые нам понадобятся
import { initCasesPage } from './cases.v2.js';
import { initInventoryPage } from './inventory.js';
import { initUpgradePage } from './upgrade.js';
import { updateBalanceInHeader } from './global.v2.js';

document.addEventListener('DOMContentLoaded', () => {
    // Находим все навигационные кнопки один раз
    const navButtons = document.querySelectorAll('.nav-button');
    const pages = document.querySelectorAll('.page');
    const appContainer = document.getElementById('app-container');

    // Функция для переключения страниц
    function navigateTo(pageId) {
        // Скрываем все страницы
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Показываем нужную
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Запускаем инициализацию конкретной страницы
            if (pageId === 'page-cases') {
                initCasesPage(); // Эта функция должна быть в cases.v2.js
            } else if (pageId === 'page-inventory') {
                initInventoryPage(); // Эта функция должна быть в inventory.js
            } else if (pageId === 'page-upgrades') {
                initUpgradePage(); // Эта функция должна быть в upgrade.js
            }
        }
    }

    // Вешаем обработчики на все кнопки навигации
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pageId = button.dataset.page;
            navigateTo(pageId);
        });
    });

    // --- Логика модального окна ---
    const addBalanceBtn = document.getElementById('add-balance-btn');
    const modal = document.getElementById('add-balance-modal');

    addBalanceBtn.addEventListener('click', () => {
        modal.classList.add('visible');
    });

    // Закрытие модального окна (например, по клику на фон)
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('visible');
        }
    });

    // --- Начальная загрузка ---
    // Показываем главную страницу по умолчанию
    navigateTo('page-main');
    
    // Загружаем и отображаем баланс пользователя при старте
    updateBalanceInHeader();
});
