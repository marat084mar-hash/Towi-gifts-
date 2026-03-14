document.addEventListener('DOMContentLoaded', async () => {
    const tg = window.Telegram?.WebApp;

    // Инициализация Telegram WebApp
    if (tg?.initDataUnsafe?.user?.id) {
        tg.ready();
        tg.expand();
        await loadUserData(tg.initDataUnsafe.user); // Загружаем данные из Supabase
    } else {
        // Блокировка интерфейса при открытии не через Telegram
        document.body.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <h2>Ошибка</h2>
                <p>Это приложение работает только внутри Telegram.</p>
                <button onclick="window.close()" style="margin-top: 20px;">Закрыть</button>
            </div>
        `;
        return; // Прерываем выполнение, если не в Telegram
    }

    // Добавляем обработчик для кнопки пополнения баланса
    const addBalanceBtn = document.querySelector('.add-balance-btn');
    if (addBalanceBtn) {
        addBalanceBtn.addEventListener('click', showTopUpModal);
    } else {
        console.warn('Кнопка пополнения баланса не найдена');
    }

    // Инициализация модального окна (выполняется только если в Telegram)
    initTopUpModal();
});

// Функция загрузки данных пользователя из Supabase
async function loadUserData(telegramUser) {
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('id, balance_ton, username')
            .eq('telegram_id', telegramUser.id)
            .single();

        if (error) {
            if (error.code === 'PGRST.55000') {
                // Пользователь не найден — создаём запись
                await createUserRecord(telegramUser);
                return await loadUserData(telegramUser); // Повторяем загрузку
            } else {
                console.error('Ошибка загрузки данных пользователя:', error);
                displayUserData(telegramUser); // Отображаем базовые данные без баланса
                return;
            }
        }

        window.userData = data; // Сохраняем в глобальную переменную
        displayUserData(telegramUser, data); // Передаём данные для отображения
    } catch (err) {
        console.error('Критическая ошибка при загрузке данных:', err);
        displayUserData(telegramUser); // Отображаем базовые данные
    }
}

// Создание записи пользователя в Supabase, если её нет
async function createUserRecord(user) {
    const { error } = await window.supabaseClient
        .from('users')
        .insert([{
            telegram_id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            balance_ton: 0.00,
            created_at: new Date().toISOString()
        }]);

    if (error) console.error('Ошибка создания пользователя:', error);
}

// Отображение данных пользователя
function displayUserData(user, userData = null) {
    const usernameElement = document.getElementById('username');
    const balanceElement = document.getElementById('balance');
    const balanceContainer = document.querySelector('.balance-container');

    // Имя пользователя
    if (usernameElement) {
        usernameElement.textContent = `@${user.username || 'user'}`;
    }

    // Баланс — берём из Supabase или показываем 0.00 TON
    if (balanceElement) {
        if (userData && userData.balance_ton !== undefined) {
            balanceElement.textContent = `${parseFloat(userData.balance_ton).toFixed(2)} TON`;
        } else {
            balanceElement.textContent = '0.00 TON';
        }
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

        // Исправленная вставка аватара в начало контейнера
        balanceContainer.prepend(avatar);
    }
}

// Функции для работы с модальным окном
function showTopUpModal() {
    const modal = document.getElementById('topUpModal');
    if (!modal) {
        console.error('Модальное окно не найдено в DOM');
        return;
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideTopUpModal() {
    const modal = document.getElementById('topUpModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function initTopUpModal() {
    const modal = document.getElementById('topUpModal');
    if (!modal) {
        console.error('Модальное окно не найдено в DOM');
        return;
    }

    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideTopUpModal);
    } else {
        console.warn('Кнопка закрытия не найдена в модальном окне');
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) hideTopUpModal();
    });

    const paymentButtons = modal.querySelectorAll('.payment-option');
    paymentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const method = button.dataset.method;
            handleTopUp(method);
        });
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
