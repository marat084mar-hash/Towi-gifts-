document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;

    // Инициализация Telegram WebApp
    if (tg?.initDataUnsafe?.user?.id) {
        tg.ready();
        tg.expand();
        displayUserData(tg.initDataUnsafe.user);
    } else {
        // Блокировка интерфейса при открытии не через Telegram
        document.body.innerHTML = `
            <div class="auth-error">
                <h1>Authentication Error</h1>
                <p>Please open this app through our official Telegram bot.</p>
            </div>
        `;
        document.head.insertAdjacentHTML('beforeend', `
            <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; }
                .auth-error { color: #ffffff; }
            </style>
        `);
    }

    // Инициализация модального окна
    initTopUpModal();
});

function displayUserData(user) {
    const usernameElement = document.getElementById('username');
    const balanceElement = document.getElementById('balance');
    const balanceContainer = document.querySelector('.balance-container');

    if (usernameElement) {
        usernameElement.textContent = `@${user.username || 'user'}`;
    }

    if (balanceElement) {
        balanceElement.textContent = '0.00 TON'; // Временное значение
    }

    // Добавляем аватар, если его ещё нет
    if (balanceContainer && !document.getElementById('user-avatar')) {
        const avatar = document.createElement('img');
        avatar.id = 'user-avatar';
        avatar.alt = 'Avatar';
        avatar.style.width = '48px';
        avatar.style.height = '48px';
        avatar.style.borderRadius = '50%';
        avatar.style.marginRight = '12px';

        // Формируем URL аватара через Telegram API
        if (user.photo_url) {
            avatar.src = user.photo_url;
        } else {
            // Заглушка, если фото нет
            avatar.src = 'https://ui-avatars.com/api/?name=' +
                encodeURIComponent(user.first_name || 'User') +
                '&background=8a2be2&color=fff';
        }

        // Вставляем аватар перед текстом баланса
        balanceContainer.insertBefore(avatar, balanceContainer.firstChild);
    }
}

// Функции для работы с модальным окном (остаются без изменений)
function showTopUpModal() {
    document.getElementById('topUpModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideTopUpModal() {
    document.getElementById('topUpModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function initTopUpModal() {
    const modal = document.getElementById('topUpModal');
    const closeBtn = document.querySelector('.close-btn');

    closeBtn.addEventListener('click', hideTopUpModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) hideTopUpModal();
    });

    document.querySelectorAll('.payment-option').forEach(button => {
        button.addEventListener('click', () => handleTopUp(button.dataset.method));
    });
}

// Обработка пополнения
function handleTopUp(method) {
    hideTopUpModal();

    switch (method) {
        case 'ton':
            alert('Пополнение через TON (бонус +10%)');
            break;
        case 'stars':
            alert('Пополнение звёздами (100 звёзд = 1 TON)');
            break;
        default:
            console.warn('Неизвестный метод пополнения:', method);
    }
}
