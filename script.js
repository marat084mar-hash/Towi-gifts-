.bottom-nav .nav-button {
    background: none;
    border: none;
    color: #e0e0e0;
    font-size: 0.9em;
    padding: 10px 15px;
    cursor: pointer;
    transition: color 0.2s ease;
}

.bottom-nav .nav-button:hover {
    color: #ffd700; /* Золотистый при наведении */
}

/* Скрываем скроллбар для эстетики */
.app-container::-webkit-scrollbar,
.screen::-webkit-scrollbar {
    width: 0;
    background: transparent;
}



## # 3. script.js (Функционал: навигация, кейсы, краш-игра, инвентарь)

Этот файл содержит JavaScript-код, который делает ваше приложение интерактивным.


javascript
document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const navButtons = document.querySelectorAll('.nav-button, .back-button');
    const replenishButton = document.querySelector('.replenish-button');

    // --- Навигация между экранами ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetScreenId = button.dataset.targetScreen;
            showScreen(targetScreenId);
        });
    });

    // Функция для показа нужного экрана
    function showScreen(id) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(id).classList.add('active');
    }

    // Обработчик кнопки пополнения (заглушка)
    replenishButton.addEventListener('click', () => {
        alert('Функция пополнения баланса будет реализована позже!');
    });

    // --- Кейсы ---
    const casesGrid = document.getElementById('cases-grid');
    const cases = [
        { id: 'bichara', name: 'Бичара', price: 10, currency: 'Stars', img: 'placeholder.png' },
        { id: 'zavodskoy', name: 'Заводской', price: 50, currency: 'Stars', img: 'placeholder.png' },
        { id: 'plaki', name: 'Плаки или нормалдаки?', price: 100, currency: 'Stars', img: 'placeholder.png' },
        { id: 'yaruy-smak', name: 'Ярый Смак', price: 250, currency: 'Stars', img: 'placeholder.png' },
        { id: 'elitny', name: 'Элитный', price: 500, currency: 'Stars', img: 'placeholder.png' },
        { id: 'ideal', name: 'Идеал', price: 1000, currency: 'Stars', img: 'placeholder.png' },
        { id: 'unlucky', name: 'Анлаки', price: 2000, currency: 'Stars', img: 'placeholder.png' },
        { id: 'oligarch', name: 'Олигарх', price: 5000, currency: 'Stars', img: 'placeholder.png' },
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
                <button class="open-button" data-case-id="${caseItem.id}">Открыть</button>
            ;
            casesGrid.appendChild(caseCard);
        });

        document.querySelectorAll('.open-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const caseId = event.target.dataset.caseId;
                alert(Открываем кейс: ${caseId}! (Эта функция будет реализована на бэкенде));
                // Здесь будет логика для запроса к Supabase Edge Function для открытия кейса
            });
        });
    }
    renderCases(); // Рендерим кейсы при загрузке

    // --- Ракет Краш Игра ---
    const rocketEmoji = document.getElementById('rocket-emoji');
    const multiplierDisplay = document.getElementById('multiplier-display');
    const gameStatus = document.getElementById('game-status');
    const startRoundButton = document.getElementById('start-round-button');
    const cashOutButton = document.getElementById('cash-out-button');
    const betInput = document.getElementById('bet-input');

    let currentMultiplier = 1.00;
    let gameRunning = false;
    let crashPoint = 0;
    let gameInterval;

function resetGame() {
        clearInterval(gameInterval);
        currentMultiplier = 1.00;
        multiplierDisplay.textContent = '1.00x';
        gameRunning = false;
        gameStatus.textContent = 'Ожидание...';
        rocketEmoji.style.animation = 'none';
        startRoundButton.disabled = false;
        cashOutButton.disabled = true;
        betInput.disabled = false;
        rocketEmoji.textContent = '🚀'; // Сброс эмодзи
        multiplierDisplay.style.color = '#00ff00'; // Зеленый
    }

    startRoundButton.addEventListener('click', () => {
        if (gameRunning) return; // Не начинать новый раунд, если игра уже идет

        resetGame(); // Сброс перед началом нового раунда
        gameRunning = true;
        startRoundButton.disabled = true;
        cashOutButton.disabled = false;
        betInput.disabled = true;
        gameStatus.textContent = 'Взлетаем!';
        rocketEmoji.style.animation = 'bounce 0.8s infinite alternate';

        // Генерация случайной точки краша от 1.01 до 10.00
        // (Для более сложной логики можно использовать более распределенные значения)
        crashPoint = parseFloat((Math.random() * (10 - 1.01) + 1.01).toFixed(2));
        console.log('Crash point:', crashPoint);

        gameInterval = setInterval(() => {
            currentMultiplier += 0.01;
            multiplierDisplay.textContent = ${currentMultiplier.toFixed(2)}x;

            if (currentMultiplier >= crashPoint) {
                crashGame();
            }
        }, 100); // Обновляем каждые 100 мс
    });

    cashOutButton.addEventListener('click', () => {
        if (!gameRunning) return;

        const bet = parseFloat(betInput.value);
        if (isNaN(bet) || bet <= 0) {
            alert('Введите корректную ставку!');
            return;
        }

        const winAmount = bet * currentMultiplier;
        alert(Вы вывели на ${currentMultiplier.toFixed(2)}x! Ваш выигрыш: ${winAmount.toFixed(2)} ⭐ (Это симуляция));
        
        // Здесь будет логика для сохранения выигрыша на бэкенде
        resetGame();
    });

    function crashGame() {
        clearInterval(gameInterval);
        gameRunning = false;
        gameStatus.textContent = КРАШ НА ${currentMultiplier.toFixed(2)}x!;
        multiplierDisplay.style.color = '#ff0000'; // Красный при краше
        rocketEmoji.style.animation = 'none';
        rocketEmoji.textContent = '💥'; // Эмодзи взрыва
        cashOutButton.disabled = true; // Вывести уже нельзя
        
        // Маленькая задержка перед сбросом для отображения результата
        setTimeout(() => {
            resetGame();
        }, 3000); 
    }

    // --- Инвентарь ---
    const inventoryList = document.getElementById('inventory-list');
    const userInventory = [
        { id: 'item1', name: 'Ключ от Заводского Кейса', description: 'Позволяет открыть Заводской Кейс', img: 'placeholder.png' },
        { id: 'item2', name: 'НФТ "Элитный Меч"', description: 'Редкий меч для коллекционеров', img: 'placeholder.png' },
        { id: 'item3', name: '1000 Звезд TON', description: 'Переводимые звезды', img: 'placeholder.png' },
    ];

    function renderInventory() {
        inventoryList.innerHTML = '';
        if (userInventory.length === 0) {
            inventoryList.innerHTML = '<p style="text-align: center; color: #bbb;">Ваш инвентарь пуст.</p>';
            return;
        }

userInventory.forEach(item => {
            const listItem = document.createElement('li');
            listItem.classList.add('inventory-item');
            listItem.innerHTML = 
                <img src="${item.img}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
                <div class="sell-withdraw-buttons">
                    <button class="sell-button" data-item-id="${item.id}">Продать</button>
                    <button class="withdraw-button" data-item-id="${item.id}">Вывести</button>
                </div>
            ;
            inventoryList.appendChild(listItem);
        });

        document.querySelectorAll('.sell-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.target.dataset.itemId;
                alert(Продаем предмет: ${itemId}! (Эта функция будет реализована на бэкенде));
            });
        });

        document.querySelectorAll('.withdraw-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.target.dataset.itemId;
                alert(Выводим предмет: ${itemId}! (Эта функция будет реализована на бэкенде, потребуется TON Connect));
            });
        });
    }
    renderInventory(); // Рендерим инвентарь при загрузке
});
``

Этот фундамент дает вам полностью интерактивный фронтенд, готовый к подключению к мощной бэкенд-логике! Удачи с вашим проектом!
