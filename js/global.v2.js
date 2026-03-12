// --- КОНФИГУРАЦИЯ SUPABASE ---
window.SUPABASE_URL = 'https://kkgjkqiwrppaszvkeqbe.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2prcWl3cnBwYXN6dmtlcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDI5MDksImV4cCI6MjA4NjMxODkwOX0.euUijEzkXldhHFbIuZuzePn2ppwON78Ub-MPLKm5a9Y';
window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Переменные для хранения информации о пользователе
window.user = {
    id: null,
    authId: null,
    telegramUserId: null,
    username: 'guest',
    balanceTon: 0.00,
    balanceStars: 0,
    nftCooldownEndTime: null
};

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ---
window.showTopUpModal = function() {
    var modal = document.getElementById('topUpModal');
    if (modal) {
        modal.classList.add('active');
    }
};

window.hideTopUpModal = function() {
    var modal = document.getElementById('topUpModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.updateUI = function(userData) {
    var userBalanceElement = document.getElementById('userBalance');
    if (userBalanceElement) {
        var balance = (userData && typeof userData.balance_ton !== 'undefined') ? userData.balance_ton.toFixed(2) : '0.00';
        userBalanceElement.innerText = 'Balance: ' + balance + ' TON';
    }
    var usernameElement = document.getElementById('username');
    if (usernameElement) {
        var username = (userData && userData.username) ? userData.username : 'guest';
        usernameElement.innerText = '@' + username;
    }
};

window.topUp = async function(currency) {
    // ВАЖНО: Проверяем authId здесь, чтобы убедиться, что пользователь аутентифицирован
    if (!window.user.authId) {
        alert('Для пополнения необходимо быть аутентифицированным. Попробуйте обновить приложение в Telegram.');
        return;
    }
    window.hideTopUpModal();
    alert('Функция пополнения (' + currency + ') будет полностью реализована после успешного теста.');
    // TODO: Добавить реальную логику пополнения через Supabase (сейчас просто alert)
};

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ---
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Страница загружена. Запускаем инициализацию...");

    var tg = window.Telegram.WebApp;
    tg.ready();

    var authUser = null; // Пользователь Supabase Auth
    var telegramUser = null; // Пользователь из Telegram initData

    // Пытаемся получить данные пользователя Telegram
    if (tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) {
        telegramUser = tg.initDataUnsafe.user;
        console.log("Данные пользователя Telegram получены:", telegramUser);
    } else {
        console.warn("Приложение открыто не в Telegram или данные пользователя недоступны. Продолжаем в гостевом режиме.");
        // alert('Пожалуйста, откройте это приложение внутри Telegram для полноценной работы.'); // Временно убираем alert
    }

    // Вход в Supabase: сначала пытаемся войти анонимно
    // Это нужно, чтобы у нас всегда был auth.uid() для RLS
    var authGetResponse = await window.supabaseClient.auth.signInAnonymously();
    if (authGetResponse.error) {
        console.error("Ошибка анонимного входа:", authGetResponse.error);
        window.updateUI(null);
        return;
    }
    authUser = authGetResponse.data.user;
    console.log("Анонимный вход выполнен (или пользователь уже был):", authUser);
    window.user.authId = authUser.id; // Присваиваем authId глобальному объекту user
                          // Теперь, когда у нас есть authId, ищем профиль пользователя в нашей таблице users
    // Если есть telegramUser, ищем по telegram_user_id. Иначе ищем по auth_id (для новых анонимных)
    var selectQuery;
    if (telegramUser) {
        selectQuery = window.supabaseClient
            .from('users')
            .select('*')
            .eq('telegram_user_id', telegramUser.id)
            .single();
    } else {
        selectQuery = window.supabaseClient
            .from('users')
            .select('*')
            .eq('auth_id', authUser.id) // Для обычных анонимных пользователей
            .single();
    }

    var profileResponse = await selectQuery;
    var userProfile = profileResponse.data;
    
    // Если профиля нет, создаем его
    if (profileResponse.error && profileResponse.error.code === 'PGRST116') {
        console.log("Профиль пользователя не найден, создаем новый...");
        
        var newUser = {
            auth_id: authUser.id,
            telegram_user_id: telegramUser ? telegramUser.id : null, // Сохраняем ID, если есть
            username: telegramUser && telegramUser.username ? telegramUser.username : ('user_' + authUser.id.substring(0, 8)),
            balance_ton: 0,
            balance_stars: 0
        };
        var insertResponse = await window.supabaseClient
            .from('users')
            .insert([newUser])
            .select()
            .single();
        
        if (insertResponse.error) {
            console.error("Ошибка при создании профиля:", insertResponse.error);
            window.updateUI(null);
            return;
        }
        userProfile = insertResponse.data;
        console.log("Новый профиль пользователя создан:", userProfile);
    } else if (profileResponse.error) {
        console.error("Ошибка при загрузке профиля:", profileResponse.error);
        window.updateUI(null);
        return;
    }

    // Обновляем глобальный объект window.user данными профиля
    window.user.id = userProfile.id;
    window.user.telegramUserId = userProfile.telegram_user_id;
    window.user.username = userProfile.username;
    window.user.balanceTon = userProfile.balance_ton;
    window.user.balanceStars = userProfile.balance_stars;
    window.user.nftCooldownEndTime = userProfile.nft_cooldown_end_time;

    console.log("Профиль пользователя загружен и обновлен:", window.user);
    window.updateUI(window.user); // Обновляем UI с актуальными данными
});
