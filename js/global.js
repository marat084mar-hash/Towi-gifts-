document.addEventListener('DOMContentLoaded', async () => {
    // 1. Проверяем наличие объекта Telegram сразу
    const tg = window.Telegram?.WebApp;

    // Проверка: запущен ли скрипт в Telegram
    // initDataUnsafe может быть пустым в браузере, поэтому проверяем конкретно platform или наличие user
    if (!tg || !tg.initDataUnsafe?.user) {
        document.body.innerHTML = 
            <div style="text-align: center; padding: 40px; color: black; background: white; height: 100vh;">
                <h2>Ошибка</h2>
                <p>Это приложение работает только внутри Telegram.</p>
                <button onclick="window.close()" style="margin-top: 20px;">Закрыть</button>
            </div>
        ;
        return; 
    }

    // Если мы здесь, значит мы в Telegram
    tg.ready();
    tg.expand();

    try {
        await loadUserData(tg.initDataUnsafe.user);
    } catch (e) {
        console.error("Ошибка при старте:", e);
    }

    const addBalanceBtn = document.querySelector('.add-balance-btn');
    if (addBalanceBtn) {
        addBalanceBtn.addEventListener('click', typeof showTopUpModal !== 'undefined' ? showTopUpModal : () => console.log('Modal function not found'));
    }

    if (typeof initTopUpModal === 'function') {
        initTopUpModal();
    }
});

async function loadUserData(telegramUser) {
    // Проверка инициализации Supabase
    if (!window.supabaseClient) {
        console.error("Supabase client не инициализирован! Проверьте подключение supabase.js");
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('id, balance_ton, username')
            .eq('telegram_id', telegramUser.id)
            .single();

        if (error) {
            // Если пользователь не найден (код ошибки P0001 или 406 в зависимости от настроек RLS/PostgREST)
            if (error.code === 'PGRST116' || error.code === 'PGRST.55000') {
                await createUserRecord(telegramUser);
                return await loadUserData(telegramUser);
            } else {
                throw error;
            }
        }

        window.userData = data;
        displayUserData(telegramUser, data);
    } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        displayUserData(telegramUser);
    }
}

async function createUserRecord(user) {
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

    if (error) console.error('Ошибка создания пользователя:', error);
}

function displayUserData(user, userData = null) {
    const usernameElement = document.getElementById('username');
    const balanceElement = document.getElementById('balance');

    if (usernameElement) {
        usernameElement.textContent = @${user.username || 'user'}`;
    }
    if (balanceElement) {
        const balance = userData?.balance_ton ? parseFloat(userData.balance_ton).toFixed(2) : '0.00';
        balanceElement.textContent = ${balance} TON;
    }
    
    // Здесь удален мусор @@ и исправлена логика вставки аватара
    const balanceContainer = document.querySelector('.balance-container');
    if (balanceContainer && !document.querySelector('.user-avatar')) {
        const avatar = document.createElement('img');
        avatar.className = 'user-avatar';
        avatar.src = user.photo_url || https://ui-avatars.com/api/?name=${user.first_name}&background=8a2be2&color=fff;
        avatar.style.width = '32px';
        avatar.style.borderRadius = '50%';
        avatar.style.marginRight = '10px';
        balanceContainer.prepend(avatar);
    }
}
