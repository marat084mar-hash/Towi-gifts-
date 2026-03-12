alert('cases.js: Скрипт CASES.JS ЗАГРУЖЕН И НАЧИНАЕТ РАБОТУ!'); // ДОБАВЛЕНО

// Глобальная переменная для хранения текущего открытого предмета (для кнопки Claim)
var currentAwardedItem = null;

// Функция для отображения кейсов на странице
async function renderCases() {
    alert('cases.js: Вызвана функция renderCases().'); // ДОБАВЛЕНО
    console.log("cases.js: Загрузка кейсов из Supabase...");
    var casesListContainer = document.getElementById('casesListContainer');
    if (!casesListContainer) {
        console.error("cases.js: ОШИБКА! Не найден контейнер для кейсов (casesListContainer).");
        alert("ОШИБКА: casesListContainer не найден! Проверьте cases.html."); // ДОБАВЛЕНО
        return;
    }
    casesListContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Загрузка кейсов...</p>';

    var { data: cases, error } = await window.supabaseClient
        .from('cases')
        .select('*')
        .eq('is_active', true)
        .order('price_ton', { ascending: true });
    if (error) {
        console.error("cases.js: ОШИБКА при загрузке кейсов из Supabase:", error);
        casesListContainer.innerHTML = '<p style="color: red; text-align: center; width: 100%;">Ошибка загрузки кейсов: ' + error.message + '</p>';
        alert("ОШИБКА Supabase при загрузке кейсов: " + error.message); // ДОБАВЛЕНО
        return;
    }

    if (cases.length === 0) {
        console.log("cases.js: Активные кейсы не найдены.");
        casesListContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Активные кейсы не найдены.</p>';
        alert("Кейсы: Активные кейсы не найдены."); // ДОБАВЛЕНО
        return;
    }

    console.log("cases.js: Кейсы успешно загружены и отображены. Количество:", cases.length);
    alert("Кейсы: успешно загружено " + cases.length + " кейсов."); // ДОБАВЛЕНО
    casesListContainer.innerHTML = '';

    cases.forEach(function(caseItem) {
        var card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-case-id', caseItem.id); 

        card.innerHTML = 
            <i class="icon fas fa-box-open"></i>
            <p class="text-label">${caseItem.name}</p>
            <p class="price">Open - ${caseItem.price_ton} TON</p>
        ;
        
        card.onclick = function() {
            openCase(caseItem);
        };

        casesListContainer.appendChild(card);
    });
    alert("Кейсы: Все карточки отображены."); // ДОБАВЛЕНО
}

// ... остальной код openCase, showCaseOpeningModal, closeCaseOpeningModal, getRandomItem, processCaseOpening, claimAwardedItem ...
// (Он остался таким же, как я давал в предыдущем большом сообщении про логику кейсов)

// --- Здесь заканчивается код renderCases() ---

// Функция, которая вызывается при клике на кейс
function openCase(caseData) {
    alert('cases.js: Вы кликнули на кейс: "' + caseData.name + '" за ' + caseData.price_ton + ' TON.');
    // Здесь будет логика:
    // 1. Проверка баланса пользователя
    // 2. Списание средств
    // 3. Запуск анимации рулетки
    // 4. Получение результата и добавление в инвентарь
}


// Глобальная переменная для хранения текущего открытого предмета (для кнопки Claim)
// var currentAwardedItem = null; // Уже объявлена выше, закомментируем или удалим дубликат


// Функция для открытия модального окна открытия кейса
function showCaseOpeningModal() {
    document.getElementById('caseOpeningModal').classList.add('active');
    // Сбрасываем анимацию и результат, показываем только "Spinning..."
    document.getElementById('caseOpeningAnimation').style.display = 'block';
    document.getElementById('caseOpeningResult').style.display = 'none';
    document.getElementById('animationText').innerText = 'Spinning...';
    document.getElementById('caseOpeningTitle').innerText = 'Opening Case...';
}

// Функция для закрытия модального окна открытия кейса
function closeCaseOpeningModal() {
    document.getElementById('caseOpeningModal').classList.remove('active');
    currentAwardedItem = null; // Сбрасываем предмет
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
    return itemsPool[itemsPool.length - 1]; // Fallback, если что-то пошло не так
}

// Функция для открытия кейса (УЖЕ БЫЛА ВЫШЕ, ПЕРЕМЕЩЕНА ИЛИ ОБЪЕДИНЕНА)
// async function openCase(caseData) { ... }
// Кнопка Claim в модальном окне результата
function claimAwardedItem() {
    if (currentAwardedItem) {
        alert('Предмет "' + currentAwardedItem.name + '" успешно добавлен в ваш инвентарь!');
        // Здесь можно было бы сделать редирект в инвентарь или просто закрыть окно
        closeCaseOpeningModal();
    } else {
        alert('Нет предмета для получения.');
    }
}

// --- Асинхронная функция для обработки открытия кейса в Supabase ---
async function processCaseOpening(caseData) {
    try {
        // 1. Списание TON
        var newBalanceTon = window.user.balanceTon - caseData.price_ton;
        var { data: updatedUser, error: updateError } = await window.supabaseClient // Используем window.supabaseClient
            .from('users')
            .update({ balance_ton: newBalanceTon })
            .eq('id', window.user.id)
            .select()
            .single();

        if (updateError) {
            console.error("cases.js: Ошибка списания TON:", updateError);
            alert("Ошибка списания TON: " + updateError.message);
            return { success: false, message: updateError.message };
        }
        window.user.balanceTon = updatedUser.balance_ton;
        console.log("cases.js: Баланс обновлен. Новый баланс:", window.user.balanceTon);

        // 2. Выбор случайного предмета
        var awardedItemData = getRandomItem(caseData.items_pool);
        if (!awardedItemData) {
            console.error("cases.js: Не удалось выбрать предмет из пула.");
            alert("Ошибка: не удалось выбрать предмет.");
            return { success: false, message: "Не удалось выбрать предмет." };
        }
        console.log("cases.js: Выбран предмет:", awardedItemData);

        // 3. Добавление предмета в инвентарь
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
        var { data: insertedItem, error: insertItemError } = await window.supabaseClient // Используем window.supabaseClient
            .from('user_inventory')
            .insert([newItem])
            .select()
            .single();

        if (insertItemError) {
            console.error("cases.js: Ошибка добавления предмета в инвентарь:", insertItemError);
            alert("Ошибка добавления предмета в инвентарь: " + insertItemError.message);
            return { success: false, message: insertItemError.message };
        }
        console.log("cases.js: Предмет добавлен в инвентарь:", insertedItem);

        // 4. Запись транзакции
        var { error: transactionError } = await window.supabaseClient // Используем window.supabaseClient
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
        }
        console.log("cases.js: Транзакция записана.");

        return { success: true, awardedItem: awardedItemData };

    } catch (e) {
        console.error("cases.js: Непредвиденная ошибка при открытии кейса:", e);
        alert("Непредвиденная ошибка при открытии кейса: " + e.message);
        return { success: false, message: e.message };
    }
}


// Запускаем отображение кейсов, когда страница загрузится
document.addEventListener('DOMContentLoaded', renderCases);
