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
    window.hideTopUpModal();
    alert('Функция пополнения (' + currency + ') будет полностью реализована после успешного теста.');
};

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ---
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Страница загружена. Запускаем инициализацию (максимально упрощенная v2)...");

    var tg = window.Telegram.WebApp;
    tg.ready();
    // Попытка получить текущего аутентифицированного пользователя
    var authGetResponse = await window.supabaseClient.auth.getUser();
    if (authGetResponse.data && authGetResponse.data.user) {
        authUser = authGetResponse.data.user;
        console.log("Пользователь уже аутентифицирован:", authUser);
    } else {
        console.log("Пользователь не аутентифицирован. Выполняем анонимный вход...");
        var signInResponse = await window.supabaseClient.auth.signInAnonymously();
        if (signInResponse.error) {
            console.error("Ошибка анонимного входа:", signInResponse.error);
            window.updateUI(null);
            return;
        }
        authUser = signInResponse.data.user;
        console.log("Анонимный вход выполнен:", authUser);
    }
    
    // Если аутентифицированный пользователь есть, пытаемся получить/создать профиль
    if (authUser) {
        window.user.authId = authUser.id;
        console.log("authId пользователя:", window.user.authId);

        var profileResponse = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('auth_id', window.user.authId)
            .single();

        var userProfile = profileResponse.data;
        
        if (profileResponse.error && profileResponse.error.code === 'PGRST116') {
            console.log("Профиль пользователя не найден, создаем новый...");
            var telegramUser = tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user : null;
            
            var newTelegramUserId = telegramUser ? telegramUser.id : Math.floor(Math.random() * 10000000000);
            var newUsername = telegramUser && telegramUser.username ? telegramUser.username : ('user_' + authUser.id.substring(0, 8));

            var newUser = {
                auth_id: window.user.authId,
                telegram_user_id: newTelegramUserId,
                username: newUsername,
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

        console.log("Профиль пользователя загружен:", userProfile);
        window.user.id = userProfile.id;
        window.user.telegramUserId = userProfile.telegram_user_id;
        window.user.username = userProfile.username;
        window.user.balanceTon = userProfile.balance_ton;
        window.user.balanceStars = userProfile.balance_stars;
        window.user.nftCooldownEndTime = userProfile.nft_cooldown_end_time;
        window.updateUI(window.user);

    } else {
        console.warn("Не удалось аутентифицировать пользователя. Используем гостевой режим.");
        window.updateUI(null);
        alert('Пожалуйста, откройте это приложение внутри Telegram для полноценной работы.');
    }
});

    var authUser = null; // Будет установлено после входа
