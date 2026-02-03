```javascript
document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const navButtons = document.querySelectorAll('.nav-button, .back-button');
    const navCards = document.querySelectorAll('.nav-card');
    const replenishButtons = document.querySelectorAll('.replenish-button');
    const replenishBalanceButton = document.querySelector('.replenish-balance-button');

    // --- Элементы баланса ---
    const tonBalanceDisplay = document.getElementById('ton-balance');
    const starsBalanceDisplay = document.getElementById('stars-balance');
    const rocketCrashTonBalanceDisplay = document.querySelector('#rocket-crash-screen .balance-ton');
    const profileTonBalanceDisplay = document.querySelector('#profile-screen .stat-card .stat-value');

    let userTonBalance = 0.00; // Начальный баланс TON
    let userStarsBalance = 0; // Начальный баланс Stars

    function updateAllBalances() {
        tonBalanceDisplay.textContent = userTonBalance.toFixed(2);
        starsBalanceDisplay.textContent = userStarsBalance;
        if (rocketCrashTonBalanceDisplay) {
            rocketCrashTonBalanceDisplay.textContent = userTonBalance.toFixed(2) + ' 💎';
        }
        if (profileTonBalanceDisplay) {
            profileTonBalanceDisplay.textContent = userTonBalance.toFixed(3) + ' 💎';
        }
    }

    // --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ И БАЗЫ ДАННЫХ (БЭКЕНД ЛОГИКА) ---
    function initializeUserSession() {
        console.log("Инициализация пользовательской сессии...");
        // В реальном приложении здесь будет запрос к вашему бэкенду
        // для загрузки реальных данных пользователя.
        
        // Для демонстрации: устанавливаем начальный баланс 0
        userTonBalance = 0.00;
        userStarsBalance = 0;
        updateAllBalances();
        console.log("Пользовательская сессия инициализирована (демо).");
    }

    initializeUserSession(); // Вызываем при загрузке приложения

    // --- Навигация между экранами ---
    showScreen('main-menu-screen');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetScreenId = button.dataset.targetScreen;
            if (targetScreenId) {
                showScreen(targetScreenId);
            }
        });
    });

    navCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetScreenId = card.dataset.targetScreen;
            if (targetScreenId) {
                showScreen(targetScreenId);
            }
        });
    });

    function showScreen(id) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(id).classList.add('active');

        // Специальная логика при входе/выходе с экрана краш-игры
        if (id === 'rocket-crash-screen') {
            if (!gameRunning) { // Если игра не была запущена, инициируем её
                startNewRoundSequence();
            }
        } else {
            // Если уходим с экрана краш-игры, останавливаем её
            if (gameRunning) {
                clearInterval(gameInterval);
                clearTimeout(roundTimeout);
                gameRunning = false;
                console.log("Краш-игра остановлена, так как пользователь покинул экран.");
            }
        }
        // Обновляем балансы на всех экранах, которые их отображают
        updateAllBalances();
    }

// --- Логика пополнения баланса ---
    replenishButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetScreenId = button.dataset.targetScreen;
            if (targetScreenId) {
                showScreen(targetScreenId); // Если кнопка ведет на экран пополнения
            } else {
                alert('Функция пополнения баланса будет реализована позже с TON Connect и Telegram Stars!');
            }
        });
    });
    replenishBalanceButton.addEventListener('click', () => {
        showScreen('topup-screen'); // Кнопка "Пополнить баланс" на профиле
    });


    // --- Функционал экрана пополнения ---
    const topupTonInput = document.getElementById('topup-ton-input');
    const topupStarsInput = document.getElementById('topup-stars-input');
    const topupTonButton = document.getElementById('topup-ton-button');
    const topupStarsButton = document.getElementById('topup-stars-button');

    // Управление кнопками +/- для пополнения
    document.querySelectorAll('#topup-screen .control-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const target = event.target.dataset.target;
            const value = parseFloat(event.target.dataset.value);
            let inputElement;

            if (target === 'topup-ton') {
                inputElement = topupTonInput;
            } else if (target === 'topup-stars') {
                inputElement = topupStarsInput;
            }

            if (inputElement) {
                let currentValue = parseFloat(inputElement.value) || 0;
                let newValue = currentValue + value;
                if (newValue < (parseFloat(inputElement.min) || 0)) { // Исправлено для min
                    newValue = parseFloat(inputElement.min || 0);
                }
                inputElement.value = newValue.toFixed(inputElement.step && inputElement.step.includes('.') ? 2 : 0);
            }
        });
    });

    // Быстрые кнопки для пополнения
    document.querySelectorAll('#topup-screen .quick-bet-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const target = event.target.dataset.target;
            const value = parseFloat(event.target.dataset.value);
            let inputElement;

            if (target === 'topup-ton') {
                inputElement = topupTonInput;
            } else if (target === 'topup-stars') {
                inputElement = topupStarsInput;
            }

            if (inputElement) {
                inputElement.value = (parseFloat(inputElement.value) || 0 + value).toFixed(inputElement.step && inputElement.step.includes('.') ? 2 : 0);
            }
        });
    });

    topupTonButton.addEventListener('click', () => {
        const amount = parseFloat(topupTonInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Введите корректную сумму для пополнения TON!');
            return;
        }
        alert(Пополняем ${amount} TON! (Эта функция требует интеграции с TON Connect для проведения реальной транзакции.));
        // В реальном приложении здесь будет вызов TON Connect и обновление баланса после успешной транзакции
        userTonBalance = parseFloat((userTonBalance + amount).toFixed(2));
        updateAllBalances();
    });

    topupStarsButton.addEventListener('click', () => {
        const amount = parseInt(topupStarsInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Введите корректную сумму для пополнения Stars!');
            return;
        }
        alert(Пополняем ${amount} Stars! (Эта функция требует интеграции с Telegram Payments API для реального пополнения Stars.));
        // В реальном приложении здесь будет вызов Telegram Payments API и обновление баланса
        userStarsBalance += amount;
        updateAllBalances();
    });

// --- Кейсы (с анимацией и демо-лутом) ---
    const casesGrid = document.getElementById('cases-grid');
    const caseOpeningModal = document.getElementById('case-opening-modal');
    const caseSpinner = document.getElementById('case-spinner');
    const caseResult = document.getElementById('case-result');
    const closeCaseModalButton = document.getElementById('close-case-modal-button');

    const cases = [
        { id: 'bichara', name: 'Бичара', price: 10, currency: 'Stars', img: 'https://via.placeholder.com/100/ff8c00/FFFFFF?text=Кейс' },
        { id: 'zavodskoy', name: 'Заводской', price: 50, currency: 'Stars', img: 'https://via.placeholder.com/100/ff8c00/FFFFFF?text=Кейс' },
        { id: 'plaki', name: 'Плаки или нормалдаки?', price: 100, currency: 'Stars', img: 'https://via.placeholder.com/100/ff8c00/FFFFFF?text=Кейс' },
        { id: 'yaruy-smak', name: 'Ярый Смак', price: 250, currency: 'Stars', img: 'https://via.placeholder.com/100/ff8c00/FFFFFF?text=Кейс' },
        { id: 'elitny', name: 'Элитный', price: 500, currency: 'Stars', img: 'https://via.placeholder.com/100/ff8c00/FFFFFF?text=Кейс' },
        { id: 'ideal', name: 'Идеал', price: 1000, currency: 'Stars', img: 'https://via.placeholder.com/100/ff8c00/FFFFFF?text=Кейс' },
        { id: 'unlucky', name: 'Анлаки', price: 2000, currency: 'Stars', img: 'https://via.placeholder.com/100/ff8c00/FFFFFF?text=Кейс' },
        { id: 'oligarch', name: 'Олигарх', price: 5000, currency: 'Stars', img: 'https://via.placeholder.com/100/ff8c00/FFFFFF?text=Кейс' },
    ];

    // Демо-наполнение кейса (пользователь сам добавит реальный лут)
    const demoCaseLoot = [
        { id: 'ton001', name: '0.01 TON', type: 'currency', value: 0.01, emoji: '💎' },
        { id: 'ton010', name: '0.10 TON', type: 'currency', value: 0.10, emoji: '💎' },
        { id: 'bear', name: 'Мишка NFT', type: 'nft', value: 0.15, emoji: '🐻' },
        { id: 'gift', name: 'Подарок NFT', type: 'nft', value: 0.25, emoji: '🎁' },
        { id: 'rose', name: 'Роза NFT', type: 'nft', value: 0.25, emoji: '🌹' },
        { id: 'cake', name: 'Тортик NFT', type: 'nft', value: 0.50, emoji: '🍰' },
        { id: 'diamond', name: 'Алмаз NFT', type: 'nft', value: 1.00, emoji: '💎' },
        { id: 'ring', name: 'Кольцо NFT', type: 'nft', value: 1.00, emoji: '💍' },
        { id: 'ton001_low', name: '0.01 TON', type: 'currency', value: 0.01, emoji: '💎' }, // Дублируем для разнообразия
        { id: 'ton010_low', name: '0.10 TON', type: 'currency', value: 0.10, emoji: '💎' },
    ];

    function renderCases() {
        casesGrid.innerHTML = '';
        cases.forEach(caseItem => {
            const caseCard = document.createElement('div');
            caseCard.classList.add('case-card');
            caseCard.innerHTML = 
                <img src="${caseItem.img}" alt="${caseItem.name}">
                <h3>${caseItem.name}</h3>
                <p>Цена: ${caseItem.price} ${caseItem.currency === 'Stars' ? '⭐' : '💎'}</p>
                <button class="open-button" data-case-id="${caseItem.id}" data-case-price="${caseItem.price}" data-case-currency="${caseItem.currency}">Открыть</button>
            ;
            casesGrid.appendChild(caseCard);
        });

        document.querySelectorAll('.open-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const caseId = event.target.dataset.caseId;
                const casePrice = parseFloat(event.target.dataset.casePrice);
                const caseCurrency = event.target.dataset.caseCurrency;

                // Проверка баланса перед открытием
                if (caseCurrency === 'Stars' && userStarsBalance < casePrice) {
                    alert(Недостаточно Stars! Вам нужно ${casePrice} ⭐, у вас ${userStarsBalance} ⭐.);
                    return;
                } else if (caseCurrency === 'TON' && userTonBalance < casePrice) { // Если бы были кейсы за TON
                    alert(Недостаточно TON! Вам нужно ${casePrice} 💎, у вас ${userTonBalance} 💎.);
                    return;
                }

// Списываем средства (демо)
                if (caseCurrency === 'Stars') {
                    userStarsBalance -= casePrice;
                } else if (caseCurrency === 'TON') {
                    userTonBalance = parseFloat((userTonBalance - casePrice).toFixed(2));
                }
                updateAllBalances();
                
                alert(Открываем кейс: ${caseId}! (Будет списано ${casePrice} ${caseCurrency === 'Stars' ? '⭐' : '💎'}));
                openCaseAnimation(caseId);
            });
        });
    }
    renderCases();

    function openCaseAnimation(caseId) {
        caseOpeningModal.classList.add('active');
        caseSpinner.innerHTML = ''; // Очищаем старые предметы
        caseResult.classList.remove('active');
        closeCaseModalButton.style.display = 'none';

        // Создаем длинную полосу предметов для прокрутки
        const itemsToSpin = [...demoCaseLoot, ...demoCaseLoot, ...demoCaseLoot, ...demoCaseLoot, ...demoCaseLoot]; // Несколько раз дублируем для эффекта
        const winningItemIndex = Math.floor(Math.random() * demoCaseLoot.length);
        const winningItem = demoCaseLoot[winningItemIndex];

        // Вставляем выигрышный элемент где-то в конце, чтобы он остановился под индикатором
        // Это упрощенная логика, в реальной игре бэкенд определяет выигрыш
        const numberOfSpins = 3; // Сколько "оборотов" сделает спиннер
        const finalStopPosition = (itemsToSpin.length * numberOfSpins) + winningItemIndex; // Достаточно большое число
        
        // Генерируем элементы для спиннера
        for (let i = 0; i < finalStopPosition + demoCaseLoot.length * 2; i++) { // Добавляем еще несколько в конец
            const item = demoCaseLoot[i % demoCaseLoot.length];
            const itemElement = document.createElement('div');
            itemElement.classList.add('spinner-item');
            if (item.emoji) {
                itemElement.innerHTML = <span class="item-emoji">${item.emoji}</span><span>${item.name}</span>;
            } else {
                itemElement.innerHTML = <img src="${item.img}" alt="${item.name}"><span>${item.name}</span>;
            }
            caseSpinner.appendChild(itemElement);
        }

        // Расчет позиции остановки
        const itemWidth = 100; // Должно соответствовать min-width в CSS
        const offset = - (finalStopPosition * itemWidth) + (caseSpinner.offsetWidth / 2) - (itemWidth / 2);

        // Запускаем анимацию прокрутки
        caseSpinner.style.transition = 'none'; // Сбрасываем переход для мгновенной установки начальной позиции
        caseSpinner.style.transform = translateX(0px);
        setTimeout(() => {
            caseSpinner.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)'; // Активируем переход
            caseSpinner.style.transform = translateX(${offset}px);
        }, 50);

        // По завершении анимации показываем результат
        const transitionEndHandler = () => {
            caseResult.innerHTML = Вы выиграли: <strong>${winningItem.name}</strong>!;
            caseResult.classList.add('active');
            closeCaseModalButton.style.display = 'block';

            // Добавляем выигранный предмет в инвентарь (демо)
            userInventory.push({
                id: winningItem.id + '_' + Date.now(), // Уникальный ID
                name: winningItem.name,
                description: Выиграно из кейса ${caseId},
                type: winningItem.type,
                value: winningItem.value,
                img_emoji: winningItem.emoji,
                nft_address: winningItem.type === 'nft' ? 'DEMO_NFT_ADDRESS_' + winningItem.id + '_' + Date.now() : undefined
            });
            renderInventory(); // Перерисовываем инвентарь
            
            // Удаляем слушатель, чтобы избежать повторных вызовов
            caseSpinner.removeEventListener('transitionend', transitionEndHandler);
        };
        caseSpinner.addEventListener('transitionend', transitionEndHandler);
closeCaseModalButton.addEventListener('click', () => {
            caseOpeningModal.classList.remove('active');
        }, { once: true }); // Закрываем модалку один раз
    }


    // --- Ракет Краш Игра (с реальным временем) ---
    const rocketEmoji = document.getElementById('rocket-emoji');
    const multiplierDisplay = document.getElementById('multiplier-display');
    const previousMultipliersContainer = document.getElementById('previous-multipliers');
    const mainActionButton = document.getElementById('main-action-button');
    const gameStatusMessage = document.getElementById('game-status-message');

    const autoCashoutCheckbox = document.getElementById('auto-cashout-checkbox');
    const autoCashoutValueDisplay = document.getElementById('auto-cashout-value');
    const betInput = document.getElementById('bet-input');

    let currentMultiplier = 1.00;
    let gameRunning = false; // Указывает, что раунд в активной фазе (полет)
    let crashPoint = 0;
    let gameInterval;
    let roundTimeout; // Для задержки между раундами
    let userBetAmount = 1; // Ставка пользователя для текущего или следующего раунда
    let autoCashoutTarget = 2.00; // Цель автовывода
    let betPlacedForCurrentRound = false; // Сделана ли ставка на ТЕКУЩИЙ раунд
    let userCashedOut = false; // Вывел ли пользователь деньги в текущем раунде

    // Инициализация значений
    betInput.value = userBetAmount;
    autoCashoutValueDisplay.textContent = x${autoCashoutTarget.toFixed(2)};

    function updateGameStatus(message, isVisible = true) {
        gameStatusMessage.textContent = message;
        gameStatusMessage.classList.toggle('visible', isVisible);
    }

    function resetGameUI() {
        clearInterval(gameInterval);
        clearTimeout(roundTimeout);
        currentMultiplier = 1.00;
        multiplierDisplay.textContent = 'x1.00';
        multiplierDisplay.classList.remove('crashed', 'cashed-out');
        rocketEmoji.style.transform = 'translateY(0%)';
        rocketEmoji.style.animation = 'none';
        rocketEmoji.textContent = '🚀'; // Возвращаем эмодзи ракеты

        mainActionButton.textContent = 'Поставить ставку';
        mainActionButton.classList.remove('betting', 'cashed-out', 'crashed');
        mainActionButton.disabled = false;
        betInput.disabled = false;
        autoCashoutCheckbox.disabled = false;

        betPlacedForCurrentRound = false;
        userCashedOut = false;
        // userBetAmount и autoCashoutTarget не сбрасываем, они остаются выбранными
        
        updateGameStatus('Ожидание нового раунда...', false);
    }

    // Симуляция данных предыдущих множителей (для демонстрации динамики)
    const previousMultipliersData = ['4.46x', '2.91x', '4.64x', '4.35x', '1.21x', '1.99x', '3.02x', '1.01x'];
    function renderPreviousMultipliers() {
        previousMultipliersContainer.innerHTML = '';
        previousMultipliersData.slice(-10).forEach(mult => { // Показываем последние 10
            const item = document.createElement('span');
            item.classList.add('previous-multiplier-item');
            if (parseFloat(mult.replace('x', '')) < 2.00) {
                item.classList.add('crashed');
            }
            item.textContent = mult;
            previousMultipliersContainer.appendChild(item);
        });
        previousMultipliersContainer.scrollLeft = previousMultipliersContainer.scrollWidth;
    }
    renderPreviousMultipliers();

    // Главная функция для управления последовательностью раундов (работает независимо)
    function startNewRoundSequence() {
        if (!document.getElementById('rocket-crash-screen').classList.contains('active')) {
            console.log("Краш-игра не активна, не запускаем раунд.");
            return; // Не запускаем, если экран не активен
        }

        resetGameUI(); // Сброс UI перед новым раундом
        gameRunning = false;

        let countdown = 5; // Например, 5 секунд до старта
        updateGameStatus(Раунд начнется через ${countdown} сек., true);

roundTimeout = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                updateGameStatus(Раунд начнется через ${countdown} сек., true);
            } else {
                clearInterval(roundTimeout);
                startRoundActual(); // Начинаем реальный полет ракеты
            }
        }, 1000);
    }

    function startRoundActual() {
        gameRunning = true;
        updateGameStatus('', false); // Скрываем сообщение
        betInput.disabled = true;
        autoCashoutCheckbox.disabled = true;

        if (betPlacedForCurrentRound) {
            // Если пользователь поставил ставку на этот раунд, активируем кнопку вывода
            mainActionButton.textContent = 'Вывести';
            mainActionButton.disabled = false;
            mainActionButton.classList.add('betting');
            console.log(Пользователь участвует в раунде со ставкой: ${userBetAmount});
        } else {
            // Если не ставил, кнопка остается неактивной и показывает статус "Вне игры"
            mainActionButton.textContent = 'Вне игры';
            mainActionButton.disabled = true;
            mainActionButton.classList.remove('betting');
            console.log("Пользователь не участвует в раунде.");
        }
        
        crashPoint = parseFloat((Math.random() * (100 - 1.01) + 1.01).toFixed(2));
        if (crashPoint < 1.05) crashPoint = 1.05; // Минимальный краш, чтобы игра была динамичной

        console.log('Crash point:', crashPoint);

        rocketEmoji.style.animation = 'flyUp 8s linear infinite forwards alternate';
        
        let animationProgress = 0;
        function animateObject() {
            animationProgress += 0.005;
            const currentY = -Math.sin(animationProgress) * 50;
            rocketEmoji.style.transform = translateY(${currentY}%);
            if (gameRunning) requestAnimationFrame(animateObject);
        }
        requestAnimationFrame(animateObject);


        gameInterval = setInterval(() => {
            currentMultiplier += 0.01;
            multiplierDisplay.textContent = x${currentMultiplier.toFixed(2)};

            if (betPlacedForCurrentRound && autoCashoutCheckbox.checked && !userCashedOut && currentMultiplier >= autoCashoutTarget) {
                cashOut();
            }

            if (currentMultiplier >= crashPoint) {
                crashGame();
            }
        }, 80);
    }

    mainActionButton.addEventListener('click', () => {
        if (mainActionButton.textContent === 'Поставить ставку') {
            // Пользователь пытается поставить ставку
            const currentBet = parseFloat(betInput.value);
            if (isNaN(currentBet) || currentBet <= 0) {
                alert('Введите корректную ставку (больше 0)!');
                return;
            }
            if (userStarsBalance < currentBet) { // Проверка баланса
                alert(Недостаточно Stars! Вам нужно ${currentBet} ⭐, у вас ${userStarsBalance} ⭐.);
                return;
            }

            userBetAmount = currentBet;
            // Здесь будет логика списания ставки с баланса пользователя (бэкенд)
            userStarsBalance -= userBetAmount; // Демо списание
            updateAllBalances();
            
            alert(Ваша ставка ${userBetAmount}⭐ принята на СЛЕДУЮЩИЙ раунд! (Требуется бэкенд));
            betPlacedForCurrentRound = true; // Указываем, что ставка сделана на следующий раунд
            mainActionButton.textContent = 'Ставка принята (ожидание)';
            mainActionButton.disabled = true; // Отключаем кнопку, пока раунд не начнется
            mainActionButton.classList.remove('betting');
            console.log(Пользователь поставил ${userBetAmount} на следующий раунд.);

        } else if (mainActionButton.textContent === 'Вывести' && betPlacedForCurrentRound && !userCashedOut) {
            // Пользователь пытается вывести средства в текущем раунде
            cashOut();
        }
    });

function cashOut() {
        if (!gameRunning || !betPlacedForCurrentRound || userCashedOut) return;

        clearInterval(gameInterval); // Останавливаем счетчик множителя для этого пользователя
        userCashedOut = true; // Пользователь вывел деньги

        const winAmount = userBetAmount * currentMultiplier;
        mainActionButton.textContent = Выведено на x${currentMultiplier.toFixed(2)};
        mainActionButton.disa
