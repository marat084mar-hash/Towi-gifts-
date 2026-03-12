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


    // Запрос к Supabase для получения всех активных кейсов
    alert('cases.js: Выполняем запрос к Supabase за кейсами...'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    var { data: cases, error } = await window.supabaseClient // Используем window.supabaseClient
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
        // alert('cases.js: Создаем карточку для кейса: ' + caseItem.name); // Можно убрать, чтобы не было слишком много alert
        var card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-case-id', caseItem.id); 

        card.innerHTML = 
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

    if (!window.user || !window.user.id) {
        alert('cases.js: ОШИБКА! Профиль пользователя не загружен. Обновите приложение в Telegram.'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        return;
    }

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
        alert('cases.js: НЕУДАЧА! ' + result.message); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    }
    
    window.updateUI(window.user); // Обновляем глобальный UI
}

// Кнопка Claim в модальном окне результата
function claimAwardedItem() {
    alert('cases.v2.js: Клик на Claim Item.'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    if (currentAwardedItem) {
        alert('Предмет "' + currentAwardedItem.name + '" успешно добавлен в ваш инвентарь!');
        closeCaseOpeningModal();
    } else {
        alert('Нет предмета для получения.');
    }
}
// --- Асинхронная функция для обработки открытия кейса в Supabase ---
async function processCaseOpening(caseData) {
    alert('cases.v2.js: Начинаем processCaseOpening().'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    try {
        // 1. Списание TON
        alert('cases.v2.js: Списываем TON: ' + caseData.price_ton); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        var newBalanceTon = window.user.balanceTon - caseData.price_ton;
        var { data: updatedUser, error: updateError } = await window.supabaseClient
            .from('users')
            .update({ balance_ton: newBalanceTon })
            .eq('id', window.user.id)
            .select()
            .single();

        if (updateError) {
            console.error("cases.js: Ошибка списания TON:", updateError);
            alert("ОШИБКА списания TON: " + updateError.message); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
            return { success: false, message: updateError.message };
        }
        window.user.balanceTon = updatedUser.balance_ton;
        alert('cases.js: Баланс успешно списан. Новый баланс: ' + window.user.balanceTon.toFixed(2)); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ

        // 2. Выбор случайного предмета
        alert('cases.v2.js: Выбираем случайный предмет...'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        var awardedItemData = getRandomItem(caseData.items_pool);
        if (!awardedItemData) {
            console.error("cases.js: Не удалось выбрать предмет из пула.");
            alert("ОШИБКА: Не удалось выбрать предмет из пула кейса."); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
            return { success: false, message: "Не удалось выбрать предмет." };
        }
        alert('cases.v2.js: Выбран предмет: ' + awardedItemData.name); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ

        // 3. Добавление предмета в инвентарь
        alert('cases.v2.js: Добавляем предмет в инвентарь...'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        var newItem = {
            user_id: window.user.id,
            nft_name: awardedItemData.name,
            nft_image_url: caseData.image_url || null,
            nft_type: awardedItemData.type,
            price_ton: 0,
            is_tradable: true,
            is_withdrawable: true,
            source: 'case_opening'
        };
        var { data: insertedItem, error: insertItemError } = await window.supabaseClient
            .from('user_inventory')
            .insert([newItem])
            .select()
            .single();

        if (insertItemError) {
            console.error("cases.js: Ошибка добавления предмета в инвентарь:", insertItemError);
            alert("ОШИБКА добавления предмета в инвентарь: " + insertItemError.message); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
            return { success: false, message: insertItemError.message };
        }
        alert('cases.v2.js: Предмет успешно добавлен в инвентарь! ID: ' + insertedItem.id); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ

        // 4. Запись транзакции
        alert('cases.v2.js: Записываем транзакцию...'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        var { error: transactionError } = await window.supabaseClient
            .from('transactions')
            .insert({
                user_id: window.user.id,
                type: 'case_opening',
                amount: -caseData.price_ton,
                currency: 'TON',
                details: {
                    case_id: caseData.id,
                    case_name: caseData.name,
                    awarded_item_id: insertedItem.id,
                    awarded_item_name: awardedItemData.name
                }
            });
        if (transactionError) {
            console.error("cases.js: Ошибка записи транзакции:", transactionError);
            alert("ВНИМАНИЕ: Ошибка записи транзакции, но кейс открыт: " + transactionError.message); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        }
        alert('cases.v2.js: Транзакция записана успешно.'); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ

        return { success: true, awardedItem: awardedItemData };
        } catch (e) {
        console.error("cases.v2.js: Непредвиденная ошибка при открытии кейса:", e);
        alert("cases.js: НЕПРЕДВИДЕННАЯ ОШИБКА при открытии кейса: " + e.message); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        return { success: false, message: e.message };
    }
}


// Запускаем отображение кейсов, когда страница загрузится
document.addEventListener('DOMContentLoaded', renderCases);
