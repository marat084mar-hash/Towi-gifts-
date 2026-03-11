// --- КОНФИГУРАЦИЯ SUPABASE ---
const SUPABASE_URL = 'https://kkgjkqiwrppaszvkeqbe.supabase.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2prcWl3cnBwYXN6dmtlcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDI5MDksImV4cCI6MjA4NjMxODkwOX0.euUijEzkXldhHFbIuZuzePn2ppwON78Ub-MPLKm5a9Y';

// Инициализация клиента Supabase
// Требуется CDN для supabase-js. Добавьте в <head> HTML-файлов:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// ИСПРАВЛЕНИЕ: Используем стандартный доступ к createClient, чтобы избежать SyntaxError
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
        switch (currency) {
        case 'ton':
            amountToAdd = 10; // Пример: +10 TON
            amountToAdd = amountToAdd * 1.1; // Бонус 10%
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
        .eq('id', user.id) // Убедитесь, что user.id корректно
        .select()
        .single();

    if (error) {
        console.error('Ошибка при пополнении баланса:', error);
        alert('Ошибка при пополнении баланса. Попробуйте еще раз. Проверьте консоль для деталей.');
    } else {
        user.balanceTon = data.balance_ton;
        user.balanceStars = data.balance_stars;
        user.nftCooldownEndTime = data.nft_cooldown_end_time;
        alert(Баланс успешно пополнен! Теперь у вас ${user.balanceTon.toFixed(2)} TON.);
        // Запись транзакции
        const { error: transactionError } = await supabaseClient.from('transactions').insert({
            user_id: user.id,
            type: deposit_${currency},
            amount: amountToAdd,
            currency: 'TON',
            details: {
                original_currency: currency,
                original_amount: (currency === 'stars' ? starsToAdd : rubAmount) || amountToAdd
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
