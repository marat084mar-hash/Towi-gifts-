// --- КОНФИГУРАЦИЯ SUPABASE ---
const SUPABASE_URL = 'https://kkgjkqiwrppaszvkeqbe.supabase.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2prcWl3cnBwYXN6dmtlcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDI5MDksImV4cCI6MjA4NjMxODkwOX0.euUijEzkXldhHFbIuZuzePn2ppwON78Ub-MPLKm5a9Y';

// Инициализация клиента Supabase
// Требуется CDN для supabase-js. Добавьте в <head> HTML-файлов:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    console.log("Загрузка данных пользователя...");
    // Получаем текущего аутентифицированного пользователя
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

        // PGRST116 означает "строка не найдена" для .single() запроса
        if (error && error.code === 'PGRST116') { 
            console.log('Запись пользователя не найдена, создаем новую...');
            const newUser = {
                auth_id: user.authId,
                telegram_user_id: Math.floor(Math.random() * 10000000000), // Временно, нужно будет брать из Telegram
                username: user_${authUser.id.substring(0, 8)}`, // Исправлено: обернуто в обратные кавычки
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
        console.log('Пользователь не аутентифицирован. Выполняем анонимный вход...');
        const { error: signInError } = await supabaseClient.auth.signInAnonymously();
        if (signInError) {
            console.error('Ошибка анонимного входа:', signInError);
        } else {
            console.log('Анонимный вход выполнен. Повторная загрузка данных пользователя...');
            await loadUserData(); // Рекурсивный вызов для загрузки данных после входа
        }
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
    // Если пользователь еще не аутентифицирован, пытаемся войти анонимно
    if (!user.authId) {
        console.warn('Пользователь не аутентифицирован при попытке пополнения. Выполняем анонимный вход...');
        await supabaseClient.auth.signInAnonymously();
        await loadUserData(); // Перезагружаем данные после попытки входа
        if (!user.authId) {
            alert('Не удалось выполнить вход для пополнения. Попробуйте обновить страницу.');
            return;
        }
    }

    // Исправлено: обернуто в обратные кавычки
    console.log(Попытка пополнения через ${currency} для пользователя ${user.username} (ID: ${user.id}));
    hideTopUpModal();

    let amountToAddTon = 0; // TON
    let starsToAdd = 0;
    let rubAmount = 0; // Только для информации

    switch (currency) {
        case 'ton':
            amountToAddTon = 10; // Пример: +10 TON
            amountToAddTon = amountToAddTon * 1.1; // Бонус 10%
            break;
        case 'stars':
            starsToAdd = 1000; // Пример: +1000 звезд
            amountToAddTon = starsToAdd / 100; // 100 звезд = 1 TON
            // Устанавливаем время окончания кулдауна
            user.nftCooldownEndTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 минут КД
            alert(После пополнения звездами активирован КД на вывод NFT на 5 минут.);
            break;
        case 'rub':
            rubAmount = 1050; // Пример: +1050 руб
            amountToAddTon = rubAmount / 105; // 105 руб = 1 TON
            break;
    }
    // Обновляем баланс в базе данных
    const { data, error } = await supabaseClient
        .from('users')
        .update({
            balance_ton: user.balanceTon + amountToAddTon,
            balance_stars: user.balanceStars + starsToAdd,
            nft_cooldown_end_time: user.nftCooldownEndTime // Обновляем КД, если был
        })
        .eq('id', user.id) // Убедитесь, что user.id корректно
        .select()
        .single();

    if (error) {
        console.error('Ошибка при пополнении баланса:', error);
        alert('Ошибка при пополнении баланса. Попробуйте еще раз. Проверьте консоль для деталей.');
    } else {
        // Обновляем локальные данные пользователя
        user.balanceTon = data.balance_ton;
        user.balanceStars = data.balance_stars;
        user.nftCooldownEndTime = data.nft_cooldown_end_time;

        alert(Баланс успешно пополнен! Теперь у вас ${user.balanceTon.toFixed(2)} TON.);
        
        // Запись транзакции
        const { error: transactionError } = await supabaseClient.from('transactions').insert({
            user_id: user.id,
            type: deposit_${currency},
            amount: amountToAddTon,
            currency: 'TON',
            details: {
                original_currency: currency,
                original_amount: (currency === 'stars' ? starsToAdd : rubAmount) || amountToAddTon // Учитываем оригинальную сумму
            }
        });
        if (transactionError) {
            console.error('Ошибка при записи транзакции:', transactionError);
        }
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
    await loadUserData(); // Запускаем загрузку данных пользователя при старте
});
