javascript
// --- КОНФИГУРАЦИЯ SUPABASE (ОБЯЗАТЕЛЬНО ИЗМЕНИ) ---
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_REF.supabase.co'; // Замени на URL твоего проекта Supabase
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Замени на твой anon key

const { createClient } = supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- КОНСТАНТЫ И ПЕРЕМЕННЫЕ ---
const TON_TO_STARS_RATE = 100; // 1 TON = 100 звезд (для внутренних операций)
const STARS_TO_TON_RATE = 1.087 / 100; // 100 звезд = 1.087 TON (для отображения и конвертации Звезд в TON)
const WITHDRAWAL_FEE_STARS = 25; // Комиссия за вывод в Звездах
let currentUserId = null;

// --- DOM ЭЛЕМЕНТЫ ---
const userNicknameSpan = document.getElementById('userNickname');
const tonBalanceSpan = document.getElementById('tonBalance');
const starsBalanceSpan = document.getElementById('starsBalance');
const casesListDiv = document.getElementById('casesList');
const inventoryListDiv = document.getElementById('inventoryList');

const topUpScreen = document.getElementById('topUpScreen');
const tonAmountInput = document.getElementById('tonAmountInput');
const starsAmountInput = document.getElementById('starsAmountInput');
const starsConversionInfo = document.getElementById('starsConversionInfo');

// Элементы Crash Game
const gameStatusDiv = document.getElementById('gameStatus');
const currentMultiplierDisplay = document.getElementById('currentMultiplierDisplay');
const betAmountInput = document.getElementById('betAmountInput');
const placeBetButton = document.getElementById('placeBetButton');
const cashOutButton = document.getElementById('cashOutButton');
const activeBetsList = document.getElementById('activeBetsList');
const roundHistoryList = document.getElementById('roundHistoryList');

// --- ФУНКЦИИ ИНИЦИАЛИЗАЦИИ И ПОМОЩНИКИ ---

// Получение ID пользователя Telegram
function getUserId() {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
        return Telegram.WebApp.initDataUnsafe.user.id;
    }
    console.error("Telegram user ID not available.");
    Telegram.WebApp.showAlert("Ошибка: ID пользователя Telegram недоступен.");
    return null;
}

// Заблюривание никнейма
function blurUsername(username) {
    if (!username || username.length < 5) return username;
    const atIndex = username.indexOf('@');
    if (atIndex !== -1) {
        const handle = username.substring(atIndex + 1);
        if (handle.length <= 4) return username;
        const visiblePart = handle.substring(0, 4);
        const blurredPart = '*'.repeat(Math.max(0, handle.length - 4));
        return @${visiblePart}${blurredPart};
    }
    const start = Math.floor(username.length / 4);
    const end = Math.ceil(username.length * 3 / 4);
    return username.substring(0, start) + '*'.repeat(end - start) + username.substring(end);
}

// Регистрация пользователя, если его нет
async function registerUserIfNeeded() {
    const userId = getUserId();
    if (!userId) return;
    currentUserId = userId; // Устанавливаем глобальный ID пользователя

    const username = Telegram.WebApp.initDataUnsafe.user.username || user_${userId};

    // Проверяем, существует ли пользователь
    const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', userId)
        .single();

    if (error && error.code === 'PGRST116') { // Пользователь не найден, создаем
        const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: userId, username: @${username} }]);
        if (insertError) {
            console.error('Ошибка при регистрации пользователя:', insertError);
            Telegram.WebApp.showAlert(Ошибка регистрации: ${insertError.message});
        } else {
            console.log('Пользователь зарегистрирован:', userId);
            userNicknameSpan.textContent = blurUsername(@${username});
        }
    } else if (error) {
        console.error('Ошибка при проверке пользователя:', error);
        Telegram.WebApp.showAlert(Ошибка при загрузке пользователя: ${error.message});
    } else {
        console.log('Пользователь уже зарегистрирован:', userId);
        userNicknameSpan.textContent = blurUsername(data.username);
    }
}

// Обновление балансов на UI
async function updateBalancesUI() {
    if (!currentUserId) return;

    const { data, error } = await supabase
        .from('users')
        .select('ton_balance, stars_balance')
        .eq('id', currentUserId)
        .single();

    if (error) {
        console.error('Ошибка загрузки баланса:', error);
        return;
    }

    tonBalanceSpan.textContent = parseFloat(data.ton_balance).toFixed(2);
    starsBalanceSpan.textContent = data.stars_balance;
}

// --- УПРАВЛЕНИЕ ЭКРАНАМИ ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(nav${screenId.replace('Screen', '')}).classList.add('active');
}

// --- ЭКРАН ПОПОЛНЕНИЯ БАЛАНСА ---
function showTopUpScreen() {
    topUpScreen.classList.remove('hidden');
    // Обновить балансы и информацию о конвертации при открытии
    updateBalancesUI();
    updateStarsConversionInfo();
}

function hideTopUpScreen() {
    topUpScreen.classList.add('hidden');
}

// Обработка переключения вкладок
document.querySelectorAll('.top-up-tabs .tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.top-up-tabs .tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        document.getElementById(button.dataset.tab + 'Content').classList.remove('hidden');

        if (button.dataset.tab === 'stars') {
            updateStarsConversionInfo();
        }
    });
});

// Обновление информации о конвертации Звезд
function updateStarsConversionInfo() {
    const amountStars = parseFloat(starsAmountInput.value);
    if (!isNaN(amountStars) && amountStars > 0) {
        const equivalentTon = (amountStars * STARS_TO_TON_RATE).toFixed(3);
        starsConversionInfo.textContent = ${amountStars} звёзд = ${equivalentTon} TON;
    } else {
        starsConversionInfo.textContent = Введите количество Звезд;
    }
}
starsAmountInput.addEventListener('input', updateStarsConversionInfo);

// Клик по кнопкам предопределенных сумм TON
document.querySelectorAll('#tonContent .amount-button').forEach(button => {
    button.addEventListener('click', () => {
        tonAmountInput.value = button.dataset.amount;
    });
});

// Клик по кнопкам предопределенных сумм Звезд
document.querySelectorAll('#starsContent .amount-button').forEach(button => {
    button.addEventListener('click', () => {
        starsAmountInput.value = button.dataset.amount;
        updateStarsConversionInfo();
    });
});

// Логика кнопки "Пополнить" для TON
document.getElementById('topUpTonButton').addEventListener('click', async () => {
    if (!currentUserId) return;

    const amountTon = parseFloat(tonAmountInput.value);

    if (isNaN(amountTon) || amountTon <= 0) {
        Telegram.WebApp.showAlert('Пожалуйста, введите корректную сумму TON.');
        return;
    }

    Telegram.WebApp.showProgress();

    // TODO: Здесь должна быть реальная интеграция с TON Connect или другим TON-платежным шлюзом.
    // После успешной внешней оплаты, ваш бэкенд или Edge Function должен вызвать Supabase RPC 'add_ton_balance'.
    // Для демонстрации, мы напрямую вызываем RPC, имитируя успешную внешнюю оплату.
    try {
        const { data, error } = await supabase
            .rpc('add_ton_balance', { user_id_param: currentUserId, amount_param: amountTon });

        Telegram.WebApp.hideProgress();

        if (error) {
            console.error('Ошибка пополнения TON:', error);
            Telegram.WebApp.showAlert(Ошибка пополнения TON: ${error.message});
        } else {
            Telegram.WebApp.showAlert(Баланс TON успешно пополнен на ${amountTon} TON!);
            await updateBalancesUI();
            hideTopUpScreen();
        }
    } catch (e) {
        Telegram.WebApp.hideProgress();
        console.error('Ошибка RPC вызова add_ton_balance:', e);
        Telegram.WebApp.showAlert(Произошла ошибка при пополнении TON.);
    }
});

// Логика кнопки "Пополнить" для Звезд
document.getElementById('topUpStarsButton').addEventListener('click', async () => {
    if (!currentUserId) return;

    const amountStars = parseInt(starsAmountInput.value);
    if (isNaN(amountStars) || amountStars <= 0) {
        Telegram.WebApp.showAlert('Пожалуйста, введите корректное количество Звезд.');
        return;
    }

if (typeof Telegram !== 'undefined' && Telegram.WebApp.isVersionAtLeast('6.6')) {
        Telegram.WebApp.showProgress();
        try {
            Telegram.WebApp.openStarsPayment(amountStars, {
                onSuccess: async function() {
                    console.log(Успешно получено ${amountStars} Звезд.);
                    const { data, error } = await supabase
                        .rpc('add_stars_balance', { user_id_param: currentUserId, amount_param: amountStars });

                    Telegram.WebApp.hideProgress();
                    if (error) {
                        console.error('Ошибка обновления баланса Звезд:', error);
                        Telegram.WebApp.showAlert(Ошибка пополнения Звезд: ${error.message});
                    } else {
                        Telegram.WebApp.showAlert(Баланс успешно пополнен на ${amountStars} Звезд!);
                        await updateBalancesUI();
                        hideTopUpScreen();
                    }
                },
                onFailure: function(errorCode) {
                    Telegram.WebApp.hideProgress();
                    console.error(Оплата Звезд не удалась с кодом: ${errorCode});
                    Telegram.WebApp.showAlert(Ошибка пополнения Звезд: ${errorCode});
                }
            });
        } catch (error) {
            Telegram.WebApp.hideProgress();
            console.error("Ошибка при открытии окна пополнения Звезд:", error);
            Telegram.WebApp.showAlert("Не удалось открыть окно пополнения Звезд.");
        }
    } else {
        Telegram.WebApp.showAlert('Telegram Web App API для Звезд не доступен или слишком стар. Обновите Telegram.');
    }
});


// --- ЭКРАН "КЕЙСЫ" ---
async function loadCases() {
    casesListDiv.innerHTML = '<p class="loading-text">Загрузка кейсов...</p>';
    const { data: cases, error } = await supabase
        .from('cases')
        .select('*')
        .order('cost_ton', { ascending: true });

    if (error) {
        console.error('Ошибка загрузки кейсов:', error);
        casesListDiv.innerHTML = <p class="loading-text" style="color:var(--red-alert);">Ошибка загрузки кейсов: ${error.message}</p>;
        return;
    }

    casesListDiv.innerHTML = ''; // Очищаем
    if (cases.length === 0) {
        casesListDiv.innerHTML = '<p class="loading-text">Кейсы пока не добавлены.</p>';
        return;
    }

    cases.forEach(caseItem => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = 
            <div class="card-image">📦</div>
            <div class="card-title">${caseItem.name}</div>
            <div class="card-cost">${parseFloat(caseItem.cost_ton).toFixed(2)} TON</div>
            <button class="card-button" data-case-id="${caseItem.id}">Открыть</button>
        ;
        card.querySelector('button').addEventListener('click', () => openCase(caseItem.id));
        casesListDiv.appendChild(card);
    });
}

async function openCase(caseId) {
    if (!currentUserId) return;

    Telegram.WebApp.showProgress();

    const { data, error } = await supabase
        .rpc('open_case', { user_id_param: currentUserId, case_id_param: caseId });

    Telegram.WebApp.hideProgress();

    if (error) {
        console.error('Ошибка при открытии кейса:', error);
        Telegram.WebApp.showAlert(Ошибка: ${error.message});
    } else {
        const result = data[0]; // Результат функции open_case
        if (result.success) {
            Telegram.WebApp.showAlert(Поздравляем! Вы выиграли: ${result.won_item_name}. Стоимость: ${parseFloat(result.won_item_value).toFixed(2)} TON);
            await updateBalancesUI(); // Обновить баланс
            if (activeScreen === 'inventoryScreen') { // Если инвентарь открыт, обновить его
                 await loadUserInventory();
            }
        } else {
            Telegram.WebApp.showAlert(Ошибка: ${result.message});
        }
    }
}
