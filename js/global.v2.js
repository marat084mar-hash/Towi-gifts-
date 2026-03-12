// --- КОНФИГУРАЦИЯ SUPABASE ---
var SUPABASE_URL = 'https://kkgjkqiwrppaszvkeqbe.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2prcWl3cnBwYXN6dmtlcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDI5MDksImV4cCI6MjA4NjMxODkwOX0.euUijEzkXldhHFbIuZuzePn2ppwON78Ub-MPLKm5a9Y';
var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ---
function showTopUpModal() {
    var modal = document.getElementById('topUpModal');
    if (modal) {
        modal.classList.add('active');
    }
}
function hideTopUpModal() {
    var modal = document.getElementById('topUpModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function updateUI(userData) {
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
}

async function topUp(currency) {
    hideTopUpModal();
    alert('Функция пополнения (' + currency + ') будет полностью реализована после успешного теста.');
}

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ---
document.addEventListener('DOMContentLoaded', async function()
                          // Делаем объект user доступным глобально для других скриптов
window.user = user;
window.updateGlobalUI = updateUI; // Также делаем функцию обновления UI глобальной
{
    console.log("Страница загружена. Запускаем инициализацию (v2)...");

    // Получаем объект Telegram Web App
    var tg = window.Telegram.WebApp;
    tg.ready();

    if (tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) {
        var telegramUser = tg.initDataUnsafe.user;
        console.log("Данные пользователя Telegram получены:", telegramUser);

        // Используем анонимный вход для получения сессии, но ищем профиль по telegram_id
        var { data: { user: authUser }, error: authError } = await supabaseClient.auth.signInAnonymously();
        if (authError) {
            console.error("Ошибка анонимного входа:", authError);
            updateUI(null);
            return;
        }

        // Ищем профиль по telegram_user_id
        var { data: userProfile, error: profileError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('telegram_user_id', telegramUser.id)
            .single();

        // Если профиля нет, создаем его
        if (profileError && profileError.code === 'PGRST116') {
            console.log("Профиль пользователя не найден, создаем новый...");
            var newUser = {
                auth_id: authUser.id,
                telegram_user_id: telegramUser.id,
                username: telegramUser.username || ('user_' + telegramUser.id),
                balance_ton: 0,
                balance_stars: 0
            };
            var { data: createdProfile, error: insertError } = await supabaseClient
                .from('users')
                .insert([newUser])
                .select()
                .single();
            
            if (insertError) {
                console.error("Ошибка при создании профиля:", insertError);
                updateUI(null);
                return;
            }
            userProfile = createdProfile;
            console.log("Новый профиль пользователя создан:", userProfile);
        } else if (profileError) {
            console.error("Ошибка при загрузке профиля:", profileError);
            updateUI(null);
            return;
        }

        console.log("Профиль пользователя загружен:", userProfile);
        updateUI(userProfile);

    } else {
        // Этот блок сработает, если открыть приложение НЕ в Telegram
        console.warn("Приложение открыто не в Telegram. Используем гостевой режим.");
        updateUI(null);
        alert('Пожалуйста, откройте это приложение внутри Telegram для полноценной работы.');
    }
});
