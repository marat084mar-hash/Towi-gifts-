.getElementById('profile-ton-balance')) {
        document.getElementById('profile-ton-balance').textContent = currentUser.tonBalance.toFixed(2);
    }
    if (document.getElementById('profile-inventory-count')) {
        document.getElementById('profile-inventory-count').textContent = currentUser.inventory.length;
    }
    renderInventory(); // Эта функция теперь будет рендерить для inventory-screen
}

function renderInventory() {
    const inventoryContainer = document.getElementById('inventory-items-container'); // Теперь это контейнер на отдельном экране
    if (!inventoryContainer) return;

    inventoryContainer.innerHTML = ''; // Очищаем

    if (currentUser.inventory.length === 0) {
        inventoryContainer.innerHTML = '<p style="color:var(--tg-theme-hint-color); text-align:center; padding: 20px;">Ваш инвентарь пуст.</p>';
    } else {
        currentUser.inventory.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('inventory-item-card');
            
            // Таймер (просто текст для MVP)
            const timerEndDate = new Date(item.timerEnd);
            const timeRemaining = formatTimeRemaining(timerEndDate);

            itemElement.innerHTML = 
                <img src="${item.imageUrl || 'https://via.placeholder.com/100'}" alt="${item.name}">
                <div class="item-value">${item.sellValue} TON</div>
                <div class="item-metadata">
                    <p>Модель: random</p>
                    <p>Фон: random</p>
                </div>
                <div class="item-buttons">
                    <button class="item-button sell-item-button" data-item-id="${item.id}">Продать</button>
                    <button class="item-button withdraw-item-button" data-item-id="${item.id}">Вывести</mbutton>
                </div>
                <div class="item-timer">${timeRemaining}</div>
            ;
            inventoryContainer.appendChild(itemElement);
        });

        // Добавляем обработчики для новых кнопок после рендера
        document.querySelectorAll('.sell-item-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.target.dataset.itemId;
                const itemToSell = currentUser.inventory.find(i => i.id === itemId);
                if (itemToSell) sellItem(itemToSell);
            });
        });

        document.querySelectorAll('.withdraw-item-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.target.dataset.itemId;
                const itemToWithdraw = currentUser.inventory.find(i => i.id === itemId);
                if (itemToWithdraw) showWithdrawModal(itemToWithdraw);
            });
        });
    }
}

// Вспомогательная функция для форматирования оставшегося времени
function formatTimeRemaining(endTime) {
    const now = new Date();
    const diffMs = endTime - now;

    if (diffMs <= 0) return 'Время истекло';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return ${days} д ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')};
}


// --- Обработчики событий ---

// Навигация
document.getElementById('profile-nav-button').addEventListener('click', () => {
    showScreen('profile-screen');
    fetchUserData(); // Обновляем данные пользователя при переходе в профиль
});
// Кнопка профиля на экране игры
if (document.getElementById('profile-nav-button-from-game')) { 
    document.getElementById('profile-nav-button-from-game').addEventListener('click', () => {
        showScreen('profile-screen');
        fetchUserData();
        stopGameUI(); // Останавливаем игру при выходе
    });
}


// Пополнение баланса (кнопка "+" и в профиле)
document.getElementById('top-up-button').addEventListener('click', () => {
    document.getElementById('top-up-modal').classList.add('active');
});
if (document.getElementById('profile-top-up-button')) {
    document.getElementById('profile-top-up-button').addEventListener('click', () => {
        document.getElementById('top-up-modal').classList.add('active');
    });
}
if (document.getElementById('game-top-up-button')) { // Кнопка пополнения на экране игры
    document.getElementById('game-top-up-button').addEventListener('click', () => {
        document.getElementById('top-up-modal').classList.add('active');
    });
}
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('top-up-modal').classList.remove('active');
});


// Выбор суммы пополнения в модальном окне
document.querySelectorAll('.top-up-option').forEach(button => {
    button.addEventListener('click', (event) => {
        const starsAmount = parseInt(event.target.dataset.stars);
        const tonAmount = starsAmount / 100; // 1 TON = 100 Stars

        // Отправляем данные боту для инициирования платежа
        Telegram.WebApp.sendData(JSON.stringify({
            action: 'top_up_ton_balance',
            user_id: currentUser.id,
            stars_amount_to_pay: starsAmount,
            ton_amount_to_receive: tonAmount
        }));

        Telegram.WebApp.showPopup({
            title: 'Пополнение',
            message: Запрос на ${tonAmount} TON (${starsAmount} ⭐) отправлен боту.,
            buttons: [{id: 'ok', type: 'default', text: 'OK'}]
        });
        document.getElementById('top-up-modal').classList.remove('active');
    });
});

// Рендер кейсов
async function renderCases(cases) {
    const casesContainer = document.getElementById('cases-container');
    casesContainer.innerHTML = '';
    cases.forEach(caseItem => {
        const caseElement = document.createElement('div');
        caseElement.classList.add('case-card');
        caseElement.dataset.caseId = caseItem.id;
        caseElement.addEventListener('click', () => openCase(caseItem));
        caseElement.innerHTML = 
            <img src="${caseItem.imageUrl}" alt="${caseItem.name}" class="case-card-image">
            <div class="case-info">
                <h3>${caseItem.name}</h3>
                <p>Стоимость: <span class="cost">${caseItem.cost.toFixed(2)}</span> TON</p>
                <p>Открывай и выигрывай!</p>
            </div>
        ;
        casesContainer.appendChild(caseElement);
    });
}

// Открытие кейса
function openCase(caseItem) {
    if (currentUser.tonBalance < caseItem.cost) {
        Telegram.WebApp.showAlert(Недостаточно TON для открытия кейса "${caseItem.name}". Вам нужно ${caseItem.cost.toFixed(2)} TON.);
        return;
    }

Telegram.WebApp.showPopup({
        title: 'Открыть кейс?',
        message: Вы хотите открыть кейс "${caseItem.name}" за ${caseItem.cost.toFixed(2)} TON?,
        buttons: [
            { id: 'yes', type: 'default', text: 'Да' },
            { id: 'no', type: 'cancel', text: 'Нет' }
        ]
    }, function(buttonId) {
        if (buttonId === 'yes') {
            // Отправляем запрос боту
            Telegram.WebApp.sendData(JSON.stringify({
                action: 'open_case',
                user_id: currentUser.id,
                case_id: caseItem.id,
                cost_in_ton: caseItem.cost
            }));
            // В реальном проекте здесь будет анимация открытия
            Telegram.WebApp.showProgress(); // Показываем прогресс
        }
    });
}

// --- Функционал продажи предмета ---
function sellItem(itemToSell) {
    Telegram.WebApp.showPopup({
        title: 'Продать предмет?',
        message: Вы хотите продать "${itemToSell.name}" за ${itemToSell.sellValue} TON?,
        buttons: [
            { id: 'yes', type: 'default', text: 'Да, продать' },
            { id: 'no', type: 'cancel', text: 'Отмена' }
        ]
    }, function(buttonId) {
        if (buttonId === 'yes') {
            Telegram.WebApp.sendData(JSON.stringify({
                action: 'sell_item',
                user_id: currentUser.id,
                item_id: itemToSell.id, // ID конкретного экземпляра предмета
                sell_value: parseFloat(itemToSell.sellValue)
            }));
            Telegram.WebApp.showProgress();
        }
    });
}

// --- Функционал вывода NFT ---
let currentItemToWithdraw = null; // Глобальная переменная для хранения выбранного предмета

function showWithdrawModal(itemToWithdraw) {
    currentItemToWithdraw = itemToWithdraw;
    document.getElementById('withdraw-item-name').textContent = itemToWithdraw.name;
    document.getElementById('ton-wallet-address').value = ''; // Очистить поле
    document.getElementById('withdraw-nft-modal').classList.add('active');
}

document.getElementById('confirm-withdraw-button').addEventListener('click', () => {
    const walletAddress = document.getElementById('ton-wallet-address').value.trim();
    if (!walletAddress) {
        Telegram.WebApp.showAlert('Пожалуйста, введите адрес вашего TON-кошелька.');
        return;
    }
    if (!currentItemToWithdraw) {
        Telegram.WebApp.showAlert('Ошибка: Предмет для вывода не выбран.');
        return;
    }

    Telegram.WebApp.showPopup({
        title: 'Подтвердить вывод?',
        message: Вы уверены, что хотите вывести "${currentItemToWithdraw.name}" на адрес "${walletAddress}"? Проверьте адрес внимательно!,
        buttons: [
            { id: 'yes', type: 'default', text: 'Да, вывести' },
            { id: 'no', type: 'cancel', text: 'Отмена' }
        ]
    }, function(buttonId) {
        if (buttonId === 'yes') {
            Telegram.WebApp.sendData(JSON.stringify({
                action: 'withdraw_nft',
                user_id: currentUser.id,
                item_id: currentItemToWithdraw.id, // ID конкретного экземпляра NFT
                ton_wallet_address: walletAddress
            }));
            Telegram.WebApp.showProgress();
            document.getElementById('withdraw-nft-modal').classList.remove('active');
        }
    });
});

document.querySelector('.close-modal-withdraw').addEventListener('click', () => {
    document.getElementById('withdraw-nft-modal').classList.remove('active');
});


// Обработка закрытия инвойса (платежа Stars)
Telegram.WebApp.onEvent('onInvoiceClosed', function(data) {
    if (data.status === 'paid') {
        // Бот пришлет receiveData с balance_updated
        Telegram.WebApp.showAlert('Оплата Stars прошла успешно! Ваш баланс TON будет обновлен ботом.');
    } else if (data.status === 'cancelled') {
        Telegram.WebApp.showAlert('Оплата Stars отменена.');
    } else if (data.status === 'failed') {
        Telegram.WebApp.showAlert('Оплата Stars не удалась.');
    }
});

// Слушаем сообщения от бота, которые приходят через Telegram.WebApp.postEvent('receiveData', ...)
Telegram.WebApp.onEvent('receiveData', function(eventData) {
    try {
        const data = JSON.parse(eventData);
        Telegram.WebApp.hideProgress(); // Скрываем прогресс после получения ответа
        
        if (data.action === 'balance_updated') {
            currentUser.tonBalance = data.new_balance;
            updateUI();
            Telegram.WebApp.showNotification({message: Ваш баланс обновлен: ${data.new_balance.toFixed(2)} TON, type: 'success'});
        } else if (data.action === 'case_opened') {
            currentUser.tonBalance = data.new_balance;
            currentUser.gamesPlayed++;
            // Убеждаемся, что gift имеет все необходимые поля (id, sellValue, timerEnd)
            let receivedGift = data.gift;
            if (!receivedGift.id) receivedGift.id = 'item_' + Math.random().toString(36).substr(2, 9);
            if (typeof receivedGift.sellValue === 'undefined') receivedGift.sellValue = (Math.random() * (5.0 - 0.1) + 0.1).toFixed(2);
            if (typeof receivedGift.timerEnd === 'undefined') {
                const now = new Date();
                now.setDate(now.getDate() + 20);
                receivedGift.timerEnd = now.toISOString();
            }
            currentUser.inventory.push(receivedGift);
            localStorage.setItem('inventory_' + currentUser.id, JSON.stringify(currentUser.inventory)); // Обновляем локальное хранилище
            updateUI();
            Telegram.WebApp.showNotification({message: Вы выиграли: ${receivedGift.name}!, type: 'success'});
            // Здесь можно показать красивую анимацию выигрыша
        } else if (data.action === 'item_sold') {
            currentUser.tonBalance = data.new_balance;
            currentUser.inventory = currentUser.inventory.filter(item => item.id !== data.item_id);
            localStorage.setItem('inventory_' + currentUser.id, JSON.stringify(currentUser.inventory)); // Обновляем локальное хранилище
            updateUI();
            Telegram.WebApp.showNotification({message: Предмет "${data.item_name}" продан за ${data.sell_value.toFixed(2)} TON!, type: 'success'});
        } else if (data.action === 'nft_withdrawn') {
            currentUser.inventory = currentUser.inventory.filter(item => item.id !== data.item_id);
            localStorage.setItem('inventory_' + currentUser.id, JSON.stringify(currentUser.inventory)); // Обновляем локальное хранилище
            updateUI();
            Telegram.WebApp.showNotification({message: NFT "${data.item_name}" успешно отправлен на ваш кошелек!, type: 'success'});
        } else if (data.action === 'error') {
            Telegram.WebApp.showAlert(data.message || 'Произошла ошибка.');
        }

    } catch (e) {
        console.error('Failed to parse data from bot:', eventData, e);
        Telegram.WebApp.hideProgress();
        Telegram.WebApp.showAlert('Произошла внутренняя ошибка.');
    }
});


// --- WebSocket-клиент для игры "Ракета" ---
let ws = null; // WebSocket-соединение
// !!! ВАЖНО: Замени на URL твоего WebSocket сервера !!!
// Если твой FastAPI сервер работает локально на 8000, то это: 'ws://localhost:8000/ws'
// Если он на публичном домене, например, api.yourgame.com, то это: 'wss://api.yourgame.com/ws'
const WS_URL = 'ws://localhost:8000/ws'; 

let gameRoundState = 'waiting'; // 'waiting', 'betting', 'flying', 'crashed'
let currentMultiplier = 1.00;
let userBetAmount = 1.00;
let userAutoCashoutMultiplier = 2.00;
let hasPlacedBet = false;
let hasCashedOut = false; // Хранит множитель, на котором вывели

function connectWebSocket() {
    Telegram.WebApp.showAlert('JS: 3. Trying to connect WebSocket'); // <<< ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        console.log("WebSocket уже подключен или подключается.");
        return;
    }

    console.log("Попытка подключения к WebSocket по адресу:", WS_URL);
    ws = new WebSocket(WS_URL);

ws.onopen = function() {
        console.log("WebSocket подключен.");
        // Отправляем данные пользователя при подключении
        ws.send(JSON.stringify({ type: 'init', user_id: currentUser.id, username: currentUser.username, telegram_init_data: Telegram.WebApp.initData }));
    };

    ws.onmessage = function(event) {
        const msg = JSON.parse(event.data);
        handleWebSocketMessage(msg);
    };

    ws.onclose = function() {
        console.warn("WebSocket отключен. Попытка переподключения через 5 секунд...");
        if (document.getElementById('rocket-game-screen').classList.contains('active')) {
            setTimeout(connectWebSocket, 5000); // Переподключаемся, только если экран игры активен
        }
    };

    ws.onerror = function(error) {
        console.error("WebSocket ошибка:", error);
        Telegram.WebApp.showAlert('Ошибка подключения к игре. Пожалуйста, попробуйте позже.');
    };
}

function handleWebSocketMessage(msg) {
    switch (msg.type) {
        case 'game_state':
            updateGameState(msg.state, msg.multiplier, msg.history);
            break;
        case 'bet_result':
            handleBetResult(msg.success, msg.message, msg.new_balance);
            break;
        case 'cashout_result':
            handleCashoutResult(msg.success, msg.message, msg.new_balance, msg.profit, msg.multiplier);
            break;
        case 'error':
            Telegram.WebApp.showAlert(Ошибка игры: ${msg.message});
            console.error("Ошибка игры от сервера:", msg.message);
            break;
        case 'balance_update': // Если сервер присылает обновление баланса (для всех клиентов пользователя)
            currentUser.tonBalance = msg.new_balance;
            updateUI();
            // Telegram.WebApp.showNotification({message: Ваш баланс обновлен: ${msg.new_balance.toFixed(2)} TON, type: 'info'});
            break;
    }
}

function updateGameState(state, multiplier = 1.00, history = []) {
    gameRoundState = state;
    currentMultiplier = multiplier;

    const currentMultiplierElement = document.getElementById('current-multiplier');
    const mainGameButton = document.getElementById('main-game-button');
    const monkeyRocket = document.getElementById('monkey-rocket');
    const multiplierHistoryElement = document.getElementById('multiplier-history');

    // Обновление истории множителей
    if (multiplierHistoryElement && history.length > 0) {
        multiplierHistoryElement.innerHTML = ''; // Очищаем
        history.forEach((m, index) => {
            const span = document.createElement('span');
            span.classList.add('history-item');
            if (index === history.length - 1) { // Последний элемент в истории
                 span.classList.add('current-last');
            }
            span.textContent = ${m.toFixed(2)}x;
            multiplierHistoryElement.appendChild(span);
        });
    }

switch (gameRoundState) {
        case 'waiting':
            currentMultiplierElement.textContent = x${multiplier.toFixed(2)};
            currentMultiplierElement.style.color = '#fff';
            mainGameButton.textContent = 'Ожидание';
            mainGameButton.classList.remove('betting', 'cashout');
            mainGameButton.classList.add('waiting');
            monkeyRocket.style.animation = 'none'; // Останавливаем анимацию
            monkeyRocket.style.opacity = '1';
            hasPlacedBet = false;
            hasCashedOut = false; // Сбрасываем флаг вывода
            break;
        case 'betting':
            currentMultiplierElement.textContent = x${multiplier.toFixed(2)};
            currentMultiplierElement.style.color = '#fff';
            mainGameButton.textContent = 'Сделать ставку';
            mainGameButton.classList.remove('waiting', 'cashout');
            mainGameButton.classList.add('betting');
            mainGameButton.disabled = false; // Разрешаем ставить
            monkeyRocket.style.animation = 'none'; // Останавливаем анимацию
            monkeyRocket.style.opacity = '1';
            hasPlacedBet = false;
            hasCashedOut = false; // Сбрасываем флаг вывода
            break;
        case 'flying':
            currentMultiplierElement.textContent = x${multiplier.toFixed(2)};
            currentMultiplierElement.style.color = '#4CAF50'; // Зеленый во время полета
            if (hasPlacedBet && !hasCashedOut) {
                mainGameButton.textContent = Вывод x${multiplier.toFixed(2)};
                mainGameButton.classList.remove('betting', 'waiting');
                mainGameButton.classList.add('cashout');
                mainGameButton.disabled = false; // Разрешаем выводить
            } else if (hasCashedOut) { // Если уже вывели
                mainGameButton.textContent = Выведено x${hasCashedOut.toFixed(2)}; 
                mainGameButton.classList.remove('betting', 'cashout');
                mainGameButton.classList.add('waiting'); 
                mainGameButton.disabled = true;
            } else { // Просто наблюдаем
                mainGameButton.textContent = Игра x${multiplier.toFixed(2)}; 
                mainGameButton.classList.remove('betting', 'cashout');
                mainGameButton.classList.add('waiting');
                mainGameButton.disabled = true;
            }
            monkeyRocket.style.animation = 'flyUp 5s infinite ease-out'; // Запускаем анимацию
            break;
        case 'crashed':
            currentMultiplierElement.textContent = x${multiplier.toFixed(2)} (Упала!);
            currentMultiplierElement.style.color = '#F44336'; // Красный при падении
            mainGameButton.textContent = 'Ожидание';
            mainGameButton.classList.remove('betting', 'cashout');
            mainGameButton.classList.add('waiting');
            mainGameButton.disabled = true; // Пока ждем следующего раунда
            monkeyRocket.style.animation = 'none'; // Останавливаем анимацию
            monkeyRocket.style.opacity = '0.5'; // Показываем, что упала
            break;
    }
    // Обновляем баланс в шапке игры
    document.getElementById('game-ton-balance').textContent = currentUser.tonBalance.toFixed(2);
}

function handleBetResult(success, message, newBalance) {
    if (success) {
        Telegram.WebApp.showNotification({message: message, type: 'success'});
        currentUser.tonBalance = newBalance;
        updateUI();
        hasPlacedBet = true;
        hasCashedOut = false; // Сброс для новой ставки
    } else {
        Telegram.WebApp.showAlert(message);
        hasPlacedBet = false;
    }
    document.getElementById('main-game-button').disabled = false; // Включаем кнопку после ответа
}

function handleCashoutResult(success, message, newBalance, profit, multiplier) {
    if (success) {
        Telegram.WebApp.showNotification({message: Вывели ${profit.toFixed(2)} TON на x${multiplier.toFixed(2)}!, type: 'success'});
        currentUser.tonBalance = newBalance;
        updateUI();
        hasCashedOut = multiplier; // Запоминаем на каком множителе вывели
    } else {
        Telegram.WebApp.showAlert(message);
    }
    document.getElementById('main-game-button').disabled = false; // Включаем кнопку после ответа
}


// --- Функции управления ставками ---
function adjustBetAmount(amount, isQuickBet = false) {
    const betInput = document.getElementById('bet-amount');
    let currentBet = parseFloat(betInput.value);
    if (isNaN(currentBet)) currentBet = 0;

    if (isQuickBet) {
        currentBet += amount;
    } else {
        currentBet += amount;
    }
    
    if (currentBet < 0.01) currentBet = 0.01; // Минимальная ставка
    betInput.value = currentBet.toFixed(2);
    userBetAmount = parseFloat(betInput.value);
}

function adjustAutoCashout(amount) {
    const autoCashoutInput = document.getElementById('auto-cashout-multiplier');
    let currentAutoCashout = parseFloat(autoCashoutInput.value);
    if (isNaN(currentAutoCashout)) currentAutoCashout = 1.00;

    currentAutoCashout += amount;
    if (currentAutoCashout < 1.01) currentAutoCashout = 1.01; // Минимальный автовывод
    autoCashoutInput.value = currentAutoCashout.toFixed(2);
    userAutoCashoutMultiplier = parseFloat(autoCashoutInput.value);
}

document.getElementById('bet-amount').addEventListener('change', (event) => {
    let val = parseFloat(event.target.value);
    if (isNaN(val) || val < 0.01) val = 0.01;
    event.target.value = val.toFixed(2);
    userBetAmount = val;
});

document.getElementById('auto-cashout-multiplier').addEventListener('change', (event) => {
    let val = parseFloat(event.target.value);
    if (isNaN(val) || val < 1.01) val = 1.01;
    event.target.value = val.toFixed(2);
    userAutoCashoutMultiplier = val;
});


// --- Главная кнопка игры ---
document.getElementById('main-game-button').addEventListener('click', () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        Telegram.WebApp.showAlert('Соединение с игрой потеряно. Попробуйте обновить страницу.');
        return;
    }
    if (!currentUser.id) {
         Telegram.WebApp.showAlert('Не удалось получить ID пользователя Telegram. Пожалуйста, перезапустите приложение.');
         return;
    }

    const autoCashoutEnabled = document.getElementById('auto-cashout-checkbox').checked;
    let autoCashoutValue = autoCashoutEnabled ? userAutoCashoutMultiplier : null;
    
    if (gameRoundState === 'betting' && !hasPlacedBet) {
        // Размещаем ставку
        if (userBetAmount > currentUser.tonBalance) {
            Telegram.WebApp.showAlert('Недостаточно TON для этой ставки.');
            return;
        }
        if (userBetAmount <= 0) {
             Telegram.WebApp.showAlert('Ставка должна быть больше 0.');
            return;
        }
        
        ws.send(JSON.stringify({
            type: 'place_bet',
            user_id: currentUser.id,
            bet_amount: userBetAmount,
            auto_cashout: autoCashoutValue
        }));
        document.getElementById('main-game-button').disabled = true; // Отключаем кнопку пока не получим ответ
    } else if (gameRoundState === 'flying' && hasPlacedBet && !hasCashedOut) {
        // Выводим ставку
        ws.send(JSON.stringify({
            type: 'cashout',
            user_id: currentUser.id,
        }));
        document.getElementById('main-game-button').disabled = true; // Отключаем кнопку пока не получим ответ
    }
});

// --- Функции для запуска/остановки UI игры ---
function startGameUI() {
    connectWebSocket();
    fetchUserData(); // Обновляем баланс в шапке
    // Убедимся, что начальное состояние кнопки установлено правильно
    updateGameState(gameRoundState, currentMultiplier);
}

function stopGameUI() {
    if (ws) {
        ws.close();
        ws = null;
    }
    // Сброс UI игры
    document.getElementById('current-multiplier').textContent = 'x1.00';
    document.getElementById('current-multiplier').style.color = '#fff';
    document.getElementById('main-game-button').textContent = 'Ожидание';
    document.getElementById('main-game-button').classList.remove('betting', 'cashout');
    document.getElementById('main-game-button').classList.add('waiting');
    document.getElementById('main-game-button').disabled = true; // По умолчанию отключена
    document.getElementById('monkey-rocket').style.animation = 'none';
    document.getElementById('monkey-rocket').style.opacity = '1';
    hasPlacedBet = false;
    hasCashedOut = false;
}


// --- Инициализация при загрузке ---
document.addEventListener('DOMContentLoaded', () => {
    Telegram.WebApp.showAlert('JS: 2. DOM Content Loaded'); // <<< ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    fetchUserData(); // Загружаем данные пользователя
    showScreen('home-screen'); // Показываем главный экран

    // Обработчики для нового главного меню
    document.getElementById('play-rocket-button').addEventListener('click', () => {
        showScreen('rocket-game-screen');
        startGameUI(); // Запускаем UI игры
    });

    document.getElementById('open-cases-button').addEventListener('click', async () => {
        showScreen('cases-list-screen');
        renderCases(await fetchCasesData()); // Загружаем и рендерим кейсы
    });

    document.getElementById('go-to-inventory-button').addEventListener('click', () => {
        showScreen('inventory-screen');
        fetchUserData(); // Обновляем данные (и инвентарь) при переходе
    });

    // Убедимся, что кнопка Профиль всегда ведет на профиль и обновляет данные
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id === 'profile-nav-button') {
            item.addEventListener('click', () => {
                showScreen('profile-screen');
                fetchUserData();
                stopGameUI
