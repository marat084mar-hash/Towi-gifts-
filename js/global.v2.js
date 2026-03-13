document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;

    // 1. Проверяем, что приложение открыто в Telegram
    if (tg.initDataUnsafe?.user?.id) {
        // Если да, инициализируем приложение
        tg.ready();
        tg.expand(); // Раскрываем приложение на весь экран

        // 2. Отображаем данные пользователя
        displayUserData(tg.initDataUnsafe.user);
    } else {
        // 3. Если открыто не в Telegram, блокируем интерфейс
        document.body.innerHTML = `
            <div class="auth-error">
                <h1>Authentication Error</h1>
                <p>Please open this app through our official Telegram bot.</p>
            </div>
        `;
        // Добавляем стили для сообщения об ошибке
        document.head.insertAdjacentHTML('beforeend', `
            <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; }
                .auth-error { color: #ffffff; }
            </style>
        `);
    }
});

function displayUserData(user) {
    // Находим элементы для отображения данных
    const usernameElement = document.getElementById('username');
    const balanceContainer = document.querySelector('.balance-container'); // Предполагаем, что у баланса есть контейнер

    if (usernameElement) {
        usernameElement.textContent = `@${user.username || 'user'}`;
    }

    // Создаем и вставляем аватар, если его еще нет
    if (balanceContainer && !document.getElementById('user-avatar')) {
        const avatar = document.createElement('img');
        avatar.id = 'user-avatar';
        avatar.alt = 'Avatar';
        avatar.style.width = '48px';
        avatar.style.height = '48px';
        avatar.style.borderRadius = '50%';
        avatar.style.marginRight = '12px';
        
        // Запрос фото профиля через твоего бота (это безопасный метод)
        // Тебе нужно будет настроить бэкенд или Supabase Function для этого.
        // Пока что поставим заглушку.
        // TODO: Заменить на реальный URL фото
        avatar.src = `https://t.me/i/userpic/320/${user.username}.jpg`; // Это не всегда работает, лучший способ - через API бота
        
        balanceContainer.prepend(avatar); // Вставляем аватар перед текстом баланса
    }

    // TODO: Здесь будет логика получения баланса из Supabase по user.id
    // const userBalance = await fetchBalance(user.id);
    // document.getElementById('balance').textContent = `${userBalance.toFixed(2)} TON`;
}
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('deposit-modal');
    const openBtn = document.querySelector('.add-balance-btn');
    const closeBtn = document.querySelector('.close-modal');

    // Открыть модалку
    if (openBtn) {
        openBtn.onclick = () => {
            modal.style.display = 'flex';
        };
    }

    // Закрыть модалку
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    // Закрыть при клике вне окна
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});

// Функции-заглушки для оплаты
function payStars() {
    Telegram.WebApp.showAlert("Оплата Stars скоро появится!");
}

function payTON() {
    // Здесь будет вызов TonConnect
    Telegram.WebApp.showAlert("Подключение к Tonkeeper...");
}

function paySBP() {
    Telegram.WebApp.showAlert("Перенаправляем на оплату СБП...");
}

// Пример функции для Supabase (добавь ее позже)
/*
async function fetchBalance(userId) {
    // const { data, error } = await supabase
    //     .from('users')
    //     .select('balance')
    //     .eq('telegram_id', userId)
    //     .single();
    //
    // if (error) return 0;
    // return data.balance;
}
*/
