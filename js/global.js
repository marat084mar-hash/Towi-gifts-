// --- КОНФИГУРАЦИЯ SUPABASE ---
// Вставьте ваш Project URL и Anon Public Key сюда!
const SUPABASE_URL = 'https://kkgjkqiwrppaszvkeqbe.supabase.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2prcWl3cnBwYXN6dmtlcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDI5MDksImV4cCI6MjA4NjMxODkwOX0.euUijEzkXldhHFbIuZuzePn2ppwON78Ub-MPLKm5a9Y';

// Инициализация клиента Supabase
// Требуется CDN для supabase-js. Добавьте в <head> HTML-файлов:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const { createClient } = supabase; // supabase глобально доступен через CDN
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Переменные для хранения информации о пользователе
let user = {
    id: null, // ID пользователя из таблицы public.users
    authId: null, // ID пользователя из Supabase Auth (auth.users)
    telegramUserId: null,
    username: 'guest',
    balanceTon: 0.00,
    balanceStars: 0,
    nftCooldownEndTime: null
};

// --- ФУНКЦИИ АУТЕНТИФИКАЦИИ И ПРОФИЛЯ ---

// Загружает данные пользователя из Supabase
async function loadUserData() {
    const { data: { user: authUser } } = await supabaseClient.auth.getUser();

    if (authUser) {
        user.authId = authUser.id;
        console.log('Аутентифицированный пользователь Supabase:', authUser);

        // Попытка найти или создать запись пользователя в нашей таблице public.users
        let { data: userData, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('auth_id', user.authId)
            .single();

        if (error && error.code === 'PGRST116') { // Нет такой записи, но запрос корректен
            console.log('Запись пользователя не найдена, создаем новую...');
            // В реальном приложении здесь можно запросить telegram_user_id и username
            // Для теста просто создадим с дефолтными значениями
            const newUser = {
                auth_id: user.authId,
                telegram_user_id: Math.floor(Math.random() * 10000000000), // Временно, нужно будет брать из Telegram
                username: user_${authUser.id.substring(0, 8)}`,
                balance_ton: 0,
                balance_stars: 0
            };
            const { data: createdUser, error: insertError } = await supabaseClient
                .from('users')
                .insert([newUser])
                .select()
                .single();

            if (insertError) {
                console.error('Ошибка при создании записи пользователя:', insertError);
            } else {
                userData = createdUser;
                console.log('Новая запись пользователя создана:', userData);
            }
        } else if (error) {
            console.error('Ошибка при загрузке данных пользователя:', error);
        }
        if (userData) {
            user.id = userData.id;
            user.telegramUserId = userData.telegram_user_id;
            user.username = userData.username;
            user.balanceTon = userData.balance_ton;
            user.balanceStars = userData.balance_stars;
            user.nftCooldownEndTime = userData.nft_cooldown_end_time;
        }
    } else {
        console.log('Пользователь не аутентифицирован.');
        // Для простоты, пока что, если пользователь не аутентифицирован,
        // мы все равно инициализируем его как 'guest'
    }
    updateUI(); // Обновляем UI после загрузки данных
}

// --- ФУНКЦИИ МОДАЛЬНОГО ОКНА ПОПОЛНЕНИЯ ---
function showTopUpModal() {
    console.log('--- showTopUpModal() вызван ---');
    const modal = document.getElementById('topUpModal');
    if (modal) {
        modal.classList.add('active');
        console.log('Модальное окно пополнения: КЛАСС ACTIVE ДОБАВЛЕН.');
    } else {
        console.error('Ошибка: Элемент с ID "topUpModal" не найден!');
        alert('Критическая ошибка: не могу найти модальное окно пополнения! Проверьте HTML.');
    }
}

function hideTopUpModal() {
    const modal = document.getElementById('topUpModal');
    if (modal) {
        modal.classList.remove('active');
        console.log('Модальное окно пополнения: КЛАСС ACTIVE УДАЛЕН.');
    }
}

// Функция для пополнения баланса (реальная логика будет на бэкенде через Supabase)
async function topUp(currency) {
    if (!user.authId) {
        alert('Пожалуйста, войдите, чтобы пополнить баланс.');
        // Здесь можно вызвать функцию входа/регистрации
        return;
    }

    console.log(Попытка пополнения через ${currency} для пользователя ${user.username});
    hideTopUpModal();

    let amountToAdd = 0; // TON
    let starsToAdd = 0;
    let rubAmount = 0; // Только для информации

    switch (currency) {
        case 'ton':
            amountToAdd = 10; // Пример: +10 TON
            // Бонус 10%
            amountToAdd = amountToAdd * 1.1;
            break;
        case 'stars':
            starsToAdd = 1000; // Пример: +1000 звезд
            amountToAdd = starsToAdd / 100; // 100 звезд = 1 TON
            user.nftCooldownEndTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 минут КД
            alert(После пополнения звездами активирован КД на вывод NFT на 5 минут.);
            break;
        case 'rub':
            rubAmount = 1050; // Пример: +1050 руб
            amountToAdd = rubAmount / 105; // 105 руб = 1 TON
            break;
    }

    // Обновляем баланс в базе данных
    const { data, error } = await supabaseClient
        .from('users')
        .update({
            balance_ton: user.balanceTon + amountToAdd,
            balance_stars: user.balanceStars + starsToAdd,
            nft_cooldown_end_time: user.nftCooldownEndTime // Обновляем КД, если был
        })
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Ошибка при пополнении баланса:', error);
        alert('Ошибка при пополнении баланса. Попробуйте еще раз.');
    } else {
        user.balanceTon = data.balance_ton;
        user.balanceStars = data.balance_stars;
        user.nftCooldownEndTime = data.nft_cooldown_end_time;
        alert(Баланс успешно пополнен! Теперь у вас ${user.balanceTon.toFixed(2)} TON.);
        // Запись транзакции
        await supabaseClient.from('transactions').insert({
            user_id: user.id,
            type: deposit_${currency},
            amount: amountToAdd,
            currency: 'TON',
            details: {
                original_currency: currency,
                original_amount: (currency === 'stars' ? starsToAdd : rubAmount) || amountToAdd
            }
        });
    }

    updateUI(); // Обновляем UI после пополнения
}


// --- ФУНКЦИИ ОБНОВЛЕНИЯ UI ---
function updateUI() {
    const userBalanceElement = document.getElementById('userBalance');
    if (userBalanceElement) {
        userBalanceElement.innerText = Balance: ${user.balanceTon.toFixed(2)} TON;
    }
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.innerText = @${user.username};
    }
    // Здесь можно добавить обновление других элементов UI
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', async () => {
    // В реальном приложении, здесь будет логика регистрации/входа.
    // Пока что, мы просто пытаемся аутентифицировать анонимного пользователя
    // или получить текущего пользователя.
    
    // ВАЖНО: Для RLS политики "based on their ID" пользователь должен быть аутентифицирован.
    // Supabase позволяет использовать анонимный вход для простоты:
    await supabaseClient.auth.signInAnonymously();
    
    // После попытки аутентификации, загружаем данные пользователя
    await loadUserData();
});
