alert('cases.v2.js: Скрипт cases.v2.js ЗАГРУЖЕН И НАЧИНАЕТ РАБОТУ!'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ

// Глобальная переменная для хранения текущего открытого предмета (для кнопки Claim)
var currentAwardedItem = null;

// Функция для отображения кейсов на странице
async function renderCases() {
    alert('cases.js: Вызвана функция renderCases().'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    console.log("cases.js: Загрузка кейсов из Supabase...");
    var casesListContainer = document.getElementById('casesListContainer');
    if (!casesListContainer) {
        console.error("cases.js: ОШИБКА! Не найден контейнер для кейсов (casesListContainer).");
        alert('cases.js: ОШИБКА! HTML-контейнер для кейсов не найден! Проверьте cases.html'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        return;
    }
    casesListContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Загрузка кейсов...</p>';

    // Проверка существования supabaseClient
    if (!window.supabaseClient) {
        console.error('Supabase client not initialized!');
        alert('cases.js: ОШИБКА! Клиент Supabase не инициализирован!');
        return;
    }

    // Запрос к Supabase для получения всех активных кейсов
    alert('cases.js: Выполняем запрос к Supabase за кейсами...'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    var { data: cases, error } = await window.supabaseClient
        .from('cases')
        .select('*')
        .eq('is_active', true)
        .order('price_ton', { ascending: true }); // Сортируем по цене

    if (error) {
        console.error("cases.js: ОШИБКА при загрузке кейсов из Supabase:", error);
        casesListContainer.innerHTML = '<p style="color: red; text-align: center; width: 100%;">Ошибка загрузки кейсов: ' + error.message + '</p>';
        alert('cases.js: ОШИБКА Supabase при загрузке кейсов: ' + error.message); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        return;
    }

    if (cases.length === 0) {
        console.log("cases.js: Активные кейсы не найдены.");
        casesListContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Активные кейсы не найдены.</p>';
        alert('cases.js: Активные кейсы не найдены в Supabase.'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        return;
    }

    alert('cases.js: Кейсы успешно загружены. Количество: ' + cases.length); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    console.log("cases.js: Кейсы успешно загружены и отображены. Количество:", cases.length);
    casesListContainer.innerHTML = ''; // Очищаем контейнер

    // Создаем карточку для каждого кейса
    cases.forEach(function(caseItem) {
        // Валидация данных caseItem
        if (!caseItem || !caseItem.name || !caseItem.price_ton) {
            console.warn('cases.js: Некорректный кейс:', caseItem);
            return;
        }

        alert('cases.js: Создаем карточку для кейса: ' + caseItem.name); // Можно убрать, чтобы не было слишком много alert
        var card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-case-id', caseItem.id);

        // Исправлено: добавлены backticks для шаблона innerHTML
        card.innerHTML = `
            <i class="icon fas fa-box-open"></i>
            <p class="text-label">${caseItem.name}</p>
            <p class="price">Open - ${caseItem.price_ton} TON</p>
        `;

        card.onclick = function() {
            openCase(caseItem);
        };

        casesListContainer.appendChild(card);
    });
    alert('cases.v2.js: Все карточки кейсов отображены.'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
}

// Функция для открытия модального окна открытия кейса
function showCaseOpeningModal() {
    document.getElementById('caseOpeningModal').classList.add('active');
    document.getElementById('caseOpeningAnimation').style.display = 'block';
    document.getElementById('caseOpeningResult').style.display = 'none';
    document.getElementById('animationText').innerText = 'Spinning...';
    document.getElementById('caseOpeningTitle').innerText = 'Opening Case...';
}

// Функция для закрытия модального окна открытия кейса
function closeCaseOpeningModal() {
    document.getElementById('caseOpeningModal').classList.remove('active');
    currentAwardedItem = null;
}

// Хелпер: Выбор случайного предмета из пула с учетом шансов
function getRandomItem(itemsPool) {
    if (!itemsPool || itemsPool.length === 0) return null;

    var totalChance = itemsPool.reduce(function(sum, item) { return sum + item.chance; }, 0);
    var randomNum = Math.random() * totalChance;
    var cumulativeChance = 0;

    for (var i = 0; i < itemsPool.length; i++) {
        cumulativeChance += itemsPool[i].chance;
        if (randomNum < cumulativeChance) {
            return itemsPool[i];
        }
    }
    return itemsPool[itemsPool.length - 1]; // Fallback
}

// Функция для открытия кейса
async function openCase(caseData) {
    alert('cases.js: Попытка открыть кейс: "' + caseData.name + '"'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    console.log("cases.v2.js: Попытка открыть кейс:", caseData);

    // Валидация caseData
    if (!caseData || !caseData.price_ton || !caseData.items_pool) {
        alert('cases.js: ОШИБКА! Некорректные данные кейса.');
        return;
    }

    if (!window.user || !window.user.id) {
        alert('cases.js: ОШИБКА! Профиль пользователя не загружен. Обновите приложение в Telegram.'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        return;
    }

    // Приведение price_ton к числу
    caseData.price_ton = parseFloat(caseData.price_ton);
    if (window.user.balanceTon < caseData.price_ton) {
        alert('cases.v2.js: Недостаточно TON для открытия "' + caseData.name + '"! Ваш баланс: ' + window.user.balanceTon.toFixed(2) + ' TON. Требуется: ' + caseData.price_ton.toFixed(2) + ' TON.'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        return;
    }

    showCaseOpeningModal();

    var animationTextElement = document.getElementById('animationText');
    var messages = ["Spinning...", "Almost there...", "What will it be?"];
    var msgIndex = 0;

    var animationInterval = setInterval(function() {
        animationTextElement.innerText = messages[msgIndex % messages.length];
        msgIndex++;
    }, 500);

    await new Promise(function(resolve) { setTimeout(resolve, 3000); });
    clearInterval(animationInterval);

    alert('cases.v2.js: Анимация завершена, обрабатываем результат...'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    var result = await processCaseOpening(caseData);

    document.getElementById('caseOpeningAnimation').style.display = 'none';
    document.getElementById('caseOpeningResult').style.display = 'block';

    if (result.success) {
        document.getElementById('caseOpeningTitle').innerText = 'Case Opened!';
        document.getElementById('awardedItemName').innerText = result.awardedItem.name;
        currentAwardedItem = result.awardedItem;
        alert('cases.js: ПОБЕДА! Вы получили: ' + result.awardedItem.name); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    } else {
        document.getElementById('caseOpeningTitle').innerText = 'Oops!';
        document.getElementById('awardedItemName').innerText = 'Something went wrong. Try again!';
        currentAwardedItem = null;
        alert('cases.js: НЕУДАЧА!
