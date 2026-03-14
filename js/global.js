document.addEventListener('DOMContentLoaded', async () => {
    const tg = window.Telegram?.WebApp;

    // 1. Улучшенная проверка: запущен ли бот в Telegram
    // В браузере platform обычно 'unknown', а user — undefined
    const isTelegram = tg?.initDataUnsafe?.user?.id !== undefined;

    if (!isTelegram) {
        document.body.innerHTML = 
            <div style="text-align: center; padding: 40px; color: #333; font-family: sans-serif;">
                <h2>Доступ ограничен</h2>
                <p>Это приложение работает только внутри Telegram бота.</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px;">Попробовать снова</button>
            </div>
        `;
        return; // Полная остановка выполнения
    }

    // Инициализация WebApp
    tg.ready();
    tg.expand();

    // Загрузка данных
    await loadUserData(tg.initDataUnsafe.user);

    // Обработка кнопки пополнения
    const addBalanceBtn = document.querySelector('.add-balance-btn');
    if (addBalanceBtn) {
        addBalanceBtn.addEventListener('click', () => {
            if (typeof showTopUpModal === 'function') {
                showTopUpModal();
            } else {
                console.error('Функция showTopUpModal не найдена');
            }
        });
    }

    if (typeof initTopUpModal === 'function') {
        initTopUpModal();
    }
});

async function loadUserData(telegramUser) {
    // Проверка, что клиент Supabase вообще существует
    if (!window.supabaseClient) {
        console.error('Supabase Client не инициализирован в window.supabaseClient');
        displayUserData(telegramUser);
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('id, balance_ton, username')
            .eq('telegram_id', telegramUser.id)
            .single();

        if (error) {
            // PGRST116 — стандартный код "запись не найдена" для .single()
            if (error.code === 'PGRST116') {
                await createUserRecord(telegramUser);
                return await loadUserData(telegramUser);
            } else {
                throw error;
            }
        }

        window.userData = data;
        displayUserData(telegramUser, data);
    } catch (err) {
        console.error('Ошибка Supabase:', err);
        displayUserData(telegramUser);
    }
}

async function createUserRecord(user) {
    try {
        const { error } = await window.supabaseClient
            .from('users')
            .insert([{
                telegram_id: user.id,
                username: user.username || null,
                first_name: user.first_name || null,
                last_name: user.last_name || null,
                balance_ton: 0.00,
                created_at: new Date().toISOString()
            }]);
            if (error) throw error;
    } catch (err) {
        console.error('Не удалось создать пользователя:', err);
    }
}

function displayUserData(user, userData = null) {
    const usernameElement = document.getElementById('username');
    const balanceElement = document.getElementById('balance');
    const balanceContainer = document.querySelector('.balance-container');

    if (usernameElement) {
        usernameElement.textContent = user.username ? @${user.username} : (user.first_name || 'User');
    }

    if (balanceElement) {
        const balance = userData?.balance_ton !== undefined ? parseFloat(userData.balance_ton).toFixed(2) : '0.00';
        balanceElement.textContent = ${balance} TON;
    }

    // Добавляем аватар, если его еще нет
    if (balanceContainer && !document.querySelector('.user-avatar')) {
        const img = document.createElement('img');
        img.className = 'user-avatar';
        img.src = user.photo_url || https://ui-avatars.com/api/?name=${user.first_name || 'U'}&background=random;
        img.style.width = '30px';
        img.style.height = '30px';
        img.style.borderRadius = '50%';
        img.style.marginRight = '8px';
        balanceContainer.prepend(img);
    }
}
