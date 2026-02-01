// --- Место для ваших данных Vercel API ---
// НАЙДИТЕ И ЗАМЕНИТЕ: 'YOUR_VERCEL_API_BASE_URL' на базовый URL вашего развернутого Vercel проекта.
// Например: 'https://my-telegram-app.vercel.app'
const VERCELL_API_BASE_URL = 'YOUR_VERCEL_API_BASE_URL';
// ------------------------------------

// Переменные для Telegram Mini App
let telegramUser = null;
let telegramWebApp = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', async () => {
    initApp();
});

async function initApp() {
    // Инициализация Telegram Mini App
    if (telegramWebApp) {
        telegramWebApp.ready();
        telegramWebApp.expand();
        telegramUser = telegramWebApp.initDataUnsafe.user;

        if (telegramUser) {
            document.getElementById('user-display-name').textContent = telegramUser.first_name || 'Пользователь';
            document.getElementById('profile-telegram-id').textContent = telegramUser.id;
            document.getElementById('profile-telegram-username').textContent = telegramUser.username ? @${telegramUser.username} : 'Нет';

            // Инициализация пользователя в БД (создание, если нет)
            await initializeUserInDB(telegramUser.id, telegramUser.username);
            await loadUserData();
            await loadCases();
        } else {
            console.error('Telegram User data not available. (initDataUnsafe.user is empty)');
            telegramWebApp.showAlert('Не удалось получить данные пользователя Telegram. Попробуйте перезапустить приложение.');
        }
    } else {
        console.error('Telegram WebApp is not available. Running in test mode.');
        // Для локального тестирования без Telegram (фиктивные данные)
        telegramUser = { id: 123456789, first_name: 'Тестовый', username: 'testuser' };
        document.getElementById('user-display-name').textContent = telegramUser.first_name;
        document.getElementById('profile-telegram-id').textContent = telegramUser.id;
        document.getElementById('profile-telegram-username').textContent = @${telegramUser.username}`;
        await initializeUserInDB(telegramUser.id, telegramUser.username);
        await loadUserData();
        await loadCases();
    }

    setupNavigation();
    telegramWebApp.onEvent('themeChanged', () => {
        console.log('Тема Telegram изменена:', telegramWebApp.colorScheme);
    });

    // Добавляем обработчики для кнопок кейсов (делегирование событий)
    document.getElementById('cases-list').addEventListener('click', async (event) => {
        const button = event.target.closest('.button.primary');
        if (button && button.dataset.caseId) {
            await openCase(button.dataset.caseId);
        }
    });

     // Обработчики кнопок для вывода NFT (будут динамически добавляться)
     document.getElementById('nft-inventory-list').addEventListener('click', async (event) => {
        const button = event.target.closest('.button.secondary'); // Кнопка "Вывести"
        if (button && button.dataset.nftInventoryId) {
            await requestNftWithdrawal(button.dataset.nftInventoryId);
        }
    });

    // --- Обработчики для пополнения Stars ---
    document.querySelector('.top-up-button').addEventListener('click', async () => {
        await promptForStarsPurchase();
    });

    telegramWebApp.onEvent('invoiceClosed', (status) => {
        if (status === 'paid') {
            telegramWebApp.showAlert('Пополнение Stars успешно! TON будет зачислен.');
            loadUserData(); // Обновить баланс
        } else if (status === 'cancelled') {
            telegramWebApp.showAlert('Покупка Stars отменена.');
        } else if (status === 'failed') {
            telegramWebApp.showAlert('Ошибка при покупке Stars.');
        }
    });
}

// Вспомогательная функция для отправки запросов к Vercel Functions
// Передает initData как токен авторизации
async function callVercelFunction(functionName, method = 'GET', body = null) {
    if (!telegramWebApp || !telegramWebApp.initData) {
        throw new Error("Telegram WebApp initData is not available for authentication.");
    }
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': Bearer ${telegramWebApp.initData}, // Передаем initData для аутентификации
    };

    const config: RequestInit = { method, headers };
    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(${VERCELL_API_BASE_URL}/api/${functionName}, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Unknown error from Vercel Function.');
    }
    return data;
}

// Инициализация пользователя в БД (создание, если нет)
// Это будет вызываться при каждом запуске Mini App, чтобы убедиться, что пользователь есть в БД
async function initializeUserInDB(userId, username) {
    try {
        await callVercelFunction('initialize-user', 'POST', { userId, username });
        console.log('Пользователь инициализирован или уже существует.');
    } catch (error) {
        console.error('Ошибка инициализации пользователя:', error);
        // Не показываем showAlert, так как это фоновая операция при старте,
        // но важно залогировать.
    }
}


// --- Навигация ---
function setupNavigation() {
    const navItems = document.querySelectorAll('.app-nav .nav-item');
    const sections = document.querySelectorAll('.app-main .section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const targetSectionId = item.dataset.section;
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSectionId) {
                    section.classList.add('active');
                }
            });

            // Обновляем данные при переходе в профиль или инвентарь
            if (targetSectionId === 'profile-section') {
                loadUserData(); // Загружаем последние данные профиля и инвентаря
            } else if (targetSectionId === 'cases-section') {
                loadCases(); // Загружаем кейсы при переходе в раздел кейсов
            }
        });
    });
}

// --- Загрузка данных пользователя ---
async function loadUserData() {
    if (!telegramUser) return; // Убедиться, что telegramUser инициализирован

    try {
        const userData = await callVercelFunction('get-user-data');
        
        document.getElementById('user-ton-balance').textContent = ${parseFloat(userData.ton_balance).toFixed(2)} TON;
        document.getElementById('profile-ton-balance').textContent = parseFloat(userData.ton_balance).toFixed(2);
        document.getElementById('ton-wallet-input').value = userData.ton_wallet_address || '';

// Отображение инвентаря NFT
        const nftInventoryList = document.getElementById('nft-inventory-list');
        nftInventoryList.innerHTML = ''; // Очищаем существующие элементы
        if (userData.nfts_inventory && userData.nfts_inventory.length > 0) {
            userData.nfts_inventory.forEach((nft: any) => { // Используем any для упрощения типа
                const nftDiv = document.createElement('div');
                nftDiv.className = 'nft-item';
                const nftDef = nft.nft_definitions; // Метаданные NFT
                nftDiv.innerHTML = 
                    <img src="${nftDef.image_url || 'https://via.placeholder.com/70/00ff00/FFFFFF?text=NFT'}" alt="${nftDef.name}">
                    <h4>${nftDef.name}</h4>
                    <p>Статус: ${
                        nft.status === 'in_inventory' ? 'В инвентаре' : 
                        (nft.status === 'pending_manual_withdrawal' ? 'Ожидает вывода' : 
                        (nft.status === 'withdrawn' ? 'Выведено' : 'Продано'))
                    }</p>
                    ${nft.status === 'in_inventory' ? <button class="button secondary" data-nft-inventory-id="${nft.id}">Вывести</button> : ''}
                ;
                nftInventoryList.appendChild(nftDiv);
            });
        } else {
            nftInventoryList.innerHTML = '<p>Инвентарь пуст.</p>';
        }

    } catch (e: any) {
        console.error('Unhandled error loading user data:', e);
        telegramWebApp.showAlert('Произошла непредвиденная ошибка при загрузке данных! ' + e.message);
    }
}

// --- Сохранение TON кошелька ---
async function saveTonWalletAddress() {
    if (!telegramUser) return;
    const address = document.getElementById('ton-wallet-input').value.trim();
    if (!address) {
        telegramWebApp.showAlert('Пожалуйста, введите адрес TON кошелька.');
        return;
    }

    const walletStatus = document.getElementById('wallet-status');
    walletStatus.textContent = 'Сохранение...';

    try {
        await callVercelFunction('update-ton-wallet-address', 'POST', { address: address });
        
        telegramWebApp.showAlert('Адрес TON кошелька успешно сохранен!');
        walletStatus.textContent = 'Сохранено!';
        walletStatus.style.color = 'var(--primary-color)';
        loadUserData(); // Обновить данные
    } catch (e: any) {
        console.error('Unhandled error saving wallet address:', e);
        telegramWebApp.showAlert('Произошла непредвиденная ошибка! ' + e.message);
        walletStatus.textContent = 'Ошибка!';
        walletStatus.style.color = 'red';
    }
}

// --- Краш-игра логика (простая симуляция фронтенда) ---
let gameInterval: number | undefined; // Уточняем тип для setInterval
let currentMultiplier = 1.00;
let isGameActive = false;

function startGame() {
    if (isGameActive) {
        telegramWebApp.showAlert('Игра уже активна!');
        return;
    }
    telegramWebApp.showAlert('Функционал краш-игры в разработке. Ваша ставка в 1 TON не будет снята.');
    // Здесь должна быть реальная логика ставки и начала игры, взаимодействующая с Vercel Function
    // isGameActive = true;
    // currentMultiplier = 1.00;
    // document.getElementById('current-multiplier').textContent = '1.00x';
    // document.getElementById('crash-game-log').innerHTML = '<h3>История раундов:</h3>';
    // telegramWebApp.showAlert('Ставка сделана! Игра началась...');

    // gameInterval = setInterval(() => { /* ... */ }, 100);
}

function cashOut() {
    if (!isGameActive) {
        telegramWebApp.showAlert('Игра не активна!');
        return;
    }
    telegramWebApp.showAlert('Функционал краш-игры в разработке.');
    // Здесь должна быть реальная логика вывода средств, взаимодействующая с Vercel Function
    // clearInterval(gameInterval);
    // isGameActive = false;
    // ...
    // loadUserData(); // Обновить баланс
}
// --- Загрузка и открытие кейсов ---
async function loadCases() {
    const casesList = document.getElementById('cases-list');
    casesList.innerHTML = '<p>Загрузка кейсов...</p>'; // Показываем загрузку

    try {
        const casesData = await callVercelFunction('get-cases');
        
        casesList.innerHTML = ''; // Очищаем "Загрузка кейсов..."
        if (casesData && casesData.length > 0) {
            casesData.forEach((caseItem: any) => { // Используем any для упрощения типа
                const caseCard = document.createElement('div');
                caseCard.className = 'case-card';
                caseCard.innerHTML = 
                    <img src="${caseItem.image_url || 'https://via.placeholder.com/100/00ff00/FFFFFF?text=Case'}" alt="${caseItem.name}" class="case-image">
                    <h3>${caseItem.name}</h3>
                    <p>Стоимость: ${parseFloat(caseItem.cost_ton).toFixed(2)} TON</p>
                    <button class="button primary" data-case-id="${caseItem.id}">Открыть</button>
                ;
                casesList.appendChild(caseCard);
            });
        } else {
            casesList.innerHTML = '<p>Нет доступных кейсов.</p>';
        }
    } catch (e: any) {
        console.error('Unhandled error loading cases:', e);
        telegramWebApp.showAlert('Произошла непредвиденная ошибка при загрузке кейсов! ' + e.message);
        casesList.innerHTML = '<p style="color:red;">Не удалось загрузить кейсы.</p>';
    }
}

async function openCase(caseId: string) {
    if (!telegramUser) return; // Убедиться, что telegramUser инициализирован
    telegramWebApp.showLoader();

    try {
        const data = await callVercelFunction('open-case', 'POST', { caseId: caseId });
        
        telegramWebApp.hideLoader();
        const result = data.won_item;
        const caseResultDiv = document.getElementById('case-result');
        caseResultDiv.innerHTML = <h3>Вы выиграли:</h3>;
        
        if (result.type === 'TON') {
            caseResultDiv.innerHTML += <p>💰 ${parseFloat(result.value).toFixed(2)} TON!</p>;
            telegramWebApp.showAlert(Поздравляем! Вы выиграли ${parseFloat(result.value).toFixed(2)} TON!);
        } else if (result.type === 'NFT') {
            const nftDef = result.nft_definitions;
            caseResultDiv.innerHTML += 
                <div class="nft-item">
                    <img src="${nftDef.image_url || 'https://via.placeholder.com/70/00ff00/FFFFFF?text=NFT'}" alt="${nftDef.name}">
                    <h4>${nftDef.name}</h4>
                    <p>Оценочная стоимость: ${parseFloat(nftDef.value_in_ton).toFixed(2)} TON</p>
                </div>
            ;
            telegramWebApp.showAlert(Поздравляем! Вы выиграли NFT: ${nftDef.name}!);
        }
        loadUserData(); // Обновить баланс и инвентарь
    } catch (e: any) {
        console.error('Unhandled error opening case:', e);
        telegramWebApp.showAlert('Произошла непредвиденная ошибка при открытии кейса! ' + e.message);
    } finally {
        telegramWebApp.hideLoader();
    }
}

// --- Запрос на вывод NFT ---
async function requestNftWithdrawal(nftInventoryId: string) {
    if (!telegramUser) return; // Убедиться, что telegramUser инициализирован
    telegramWebApp.showLoader();

    try {
        const data = await callVercelFunction('request-nft-withdrawal', 'POST', { nftInventoryId: nftInventoryId });
        
        telegramWebApp.hideLoader();
        telegramWebApp.showPopup({
            title: "Запрос на вывод NFT",
            message: data.message,
            buttons: [{ text: "Ок", type: "ok" }]
        });
        loadUserData(); // Обновляем статус NFT в инвентаре
    } catch (e: any) {
        console.error('Unhandled error requesting NFT withdrawal:', e);
        telegramWebApp.showAlert('Произошла непредвиденная ошибка при запросе на вывод NFT! ' + e.message);
    } finally {
        telegramWebApp.hideLoader();
    }
}

// --- Функционал пополнения Stars ---
async function promptForStarsPurchase() {
    if (!telegramUser || !telegramWebApp) return;

    telegramWebApp.showPopup({
        title: "Пополнить TON",
        message: "Выберите количество Stars для покупки TON:",
        buttons: [
            { id: '100_stars', text: '100 Stars (~1 TON)', type: 'default' },
            { id: '500_stars', text: '500 Stars (~5 TON)', type: 'default' },
            { id: '1000_stars', text: '1000 Stars (~10 TON)', type: 'default' },
            { id: 'cancel', text: 'Отмена', type: 'cancel' }
        ]
    }, async (buttonId) => {
        let starsToBuy = 0;
        if (buttonId === '100_stars') starsToBuy = 100;
        else if (buttonId === '500_stars') starsToBuy = 500;
        else if (buttonId === '1000_stars') starsToBuy = 1000;
        else return;

        telegramWebApp.showLoader();
        try {
            const data = await callVercelFunction('initiate-stars-payment', 'POST', { starsAmount: starsToBuy });
            
            const { invoice_payload, stars_amount } = data;

            telegramWebApp.buyStars({
                amount: stars_amount,
                invoice_payload: invoice_payload,
            });

        } catch (e: any) {
            console.error('Непредвиденная ошибка при покупке Stars:', e);
            telegramWebApp.showAlert('Произошла непредвиденная ошибка при покупке Stars: ' + e.message);
        } finally {
            telegramWebApp.hideLoader();
        }
    });
}
```
