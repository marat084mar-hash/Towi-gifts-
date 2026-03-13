document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;

    // Сначала проверяем, что мы вообще в контексте Telegram Web App
    if (tg && tg.initDataUnsafe) {
        tg.ready();
        tg.expand(); // Разворачиваем приложение на весь экран

        // Инициализируем модальное окно пополнения независимо от наличия данных пользователя
        initDepositModal();

        // Теперь пытаемся отобразить пользовательские данные, если они доступны
        if (tg.initDataUnsafe.user) {
            displayUserData(tg.initDataUnsafe.user);
        } else {
            console.warn("Telegram user data not available in initDataUnsafe.user. Displaying @guest.");
            // Если данных пользователя нет, но мы в ТГ, то хотя бы имя по умолчанию
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = @guest;
            }
        }

    } else {
        // Если не в контексте Telegram Web App, показываем ошибку
        document.body.innerHTML = 
            <div class="auth-error">
                <h1>Authentication Error</h1>
                <p>Please open this app through our official Telegram bot.</p>
                <p>@Tow1Gift_bot</p>
            </div>
        ;
        // Базовые стили для ошибки, если CSS не подтянулся
        document.head.insertAdjacentHTML('beforeend', 
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    text-align: center;
                    background-color: #100f14;
                    font-family: 'Inter', sans-serif;
                }
            </style>
        );
    }
});

function displayUserData(user) {
    const usernameElement = document.getElementById('username');
    const userInfoDisplay = document.querySelector('.user-info-display'); // Таргет для аватара и текста

    if (usernameElement) {
        usernameElement.textContent = @${user.username || 'user'};
    }

    // Обработка аватара: убедимся, что не дублируем и вставляем в правильный элемент
    if (userInfoDisplay && !document.getElementById('user-avatar')) {
        const avatar = document.createElement('img');
        avatar.id = 'user-avatar';
        avatar.alt = 'User Avatar';
        avatar.style.width = '48px';
        avatar.style.height = '48px';
        avatar.style.borderRadius = '50%';
        avatar.style.marginRight = '12px';
        avatar.style.objectFit = 'cover';
        // ВАЖНО: Реальный URL аватара нужно получить через бэкенд твоего бота.
        // Пока используем надежную заглушку с первой буквой имени пользователя.
        avatar.src = https://via.placeholder.com/48/8a2be2/FFFFFF?text=${(user.username || 'U').charAt(0).toUpperCase()};
        // Если у тебя был бы бэкенд для получения аватара:
        // avatar.src = /api/get_avatar?user_id=${user.id};

        userInfoDisplay.prepend(avatar); // Вставляем аватар перед текстом баланса
    }

    // TODO: Здесь будет логика получения баланса из Supabase по user.id
    // const userBalance = await fetchBalance(user.id);
    // document.getElementById('balance').textContent = ${userBalance.toFixed(2)} TON;
}

function initDepositModal() {
    const modal = document.getElementById('deposit-modal');
    const openBtn = document.querySelector('.add-balance-btn');
    const closeBtn = document.querySelector('.close-modal');

    if (!modal || !openBtn || !closeBtn) {
        console.warn("Deposit modal elements not found. Skipping modal initialization.");
        return; // Если элементы не найдены, то не пытаемся их использовать
    }

    // Открытие окна по клику на +
    openBtn.onclick = (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
        if (window.Telegram.WebApp) window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    };

    // Закрытие окна
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // Закрытие при клике на фон
    window.onclick = (event) => {
        if (event.target === modal) { // Использовал === для строгого сравнения
            modal.style.display = 'none';
        }
    };
}

// Логика выбора оплаты
function pay(method) {
    const tg = window.Telegram.WebApp;
    if (!tg) {
        alert("Telegram Web App not initialized.");
        return;
    }

    switch(method) {
        case 'ton':
            tg.showConfirm("Connect Tonkeeper to pay with TON?", (confirmed) => {
                if (confirmed) {
                    tg.showAlert("Initiating TON payment...");
                    // TODO: Здесь, реализуй фактическую логику оплаты TON через TonConnect
                }
            });
            break;
        case 'stars':
            tg.showAlert("Telegram Stars payment coming soon!");
            // TODO: Здесь, реализуй фактическую логику оплаты через Telegram Stars API
            break;
        case 'sbp':
            tg.openLink("https://твоя-ссылка-на-оплату.com"); // Замени на свою реальную ссылку на оплату СБП
            break;
    }
}
