// --- КОНФИГУРАЦИЯ SUPABASE ---
var SUPABASE_URL = 'https://kkgjkqiwrppaszvkeqbe.supabase.com';
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
        userBalanceElement.innerText = 'Balance: ' + (userData ? userData.balance_ton.toFixed(2) : '0.00') + ' TON';
    }
    var usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.innerText = '@' + (userData ? userData.username : 'guest');
    }
}

async function topUp(currency) {
    hideTopUpModal();
    alert('Функция пополнения (' + currency + ') будет полностью реализована после успешного теста.');
}

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ---
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Страница загружена. Запускаем инициализацию...");

    var authResponse = await supabaseClient.auth.getUser();
    var authUser = authResponse.data && authResponse.data.user ? authResponse.data.user : null;

    if (!authUser) {
        console.log("Пользователь не аутентифицирован. Выполняем анонимный вход...");
        var signInResponse = await supabaseClient.auth.signInAnonymously();
        if (signInResponse.error) {
            console.error("Ошибка анонимного входа:", signInResponse.error);
            updateUI(null); // Показать гостевой режим
            return;
        }
        authUser = signInResponse.data.user;
        console.log("Анонимный вход выполнен:", authUser);
    } else {
        console.log("Пользователь уже аутентифицирован:", authUser);
    }

    // Ищем профиль пользователя в нашей таблице users
    var profileResponse = await supabaseClient
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();
    var userProfile = profileResponse.data;
    
    // Если профиля нет, создаем его
    if (profileResponse.error && profileResponse.error.code === 'PGRST116') {
        console.log("Профиль пользователя не найден, создаем новый...");
        var newUser = {
            auth_id: authUser.id,
            telegram_user_id: Math.floor(Math.random() * 10000000000),
            username: 'user_' + authUser.id.substring(0, 8),
            balance_ton: 0,
            balance_stars: 0
        };
        var insertResponse = await supabaseClient
            .from('users')
            .insert([newUser])
            .select()
            .single();
        
        if (insertResponse.error) {
            console.error("Ошибка при создании профиля:", insertResponse.error);
            updateUI(null);
            return;
        }
        userProfile = insertResponse.data;
        console.log("Новый профиль пользователя создан:", userProfile);
    } else if (profileResponse.error) {
        console.error("Ошибка при загрузке профиля:", profileResponse.error);
        updateUI(null);
        return;
    }

    console.log("Профиль пользователя загружен:", userProfile);
    updateUI(userProfile);
});
