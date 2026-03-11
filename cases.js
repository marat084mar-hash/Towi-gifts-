// Данные о кейсах (пока на фронтенде, но лучше хранить в Supabase)
const casesData = [
    { id: 'case-1', name: 'Обычный Кейс', icon: '🚬', price: 5.00, gifts: ['Подарок A', 'Подарок B', 'Подарок C'], successChance: 0.7 },
    { id: 'case-2', name: 'Редкий Кейс', icon: '🐱', price: 10.00, gifts: ['Подарок D', 'Подарок E', 'Подарок F'], successChance: 0.5 },
    { id: 'case-3', name: 'Элитный Кейс', icon: '💎', price: 15.00, gifts: ['Подарок G', 'Подарок H', 'Подарок I'], successChance: 0.3 },
    { id: 'case-4', name: 'Легендарный Кейс', icon: '🐻', price: 20.00, gifts: ['Подарок J', 'Подарок K', 'Подарок L'], successChance: 0.1 },
    // Добавь еще 5 кейсов до 25 TON
    { id: 'case-5', name: 'Кейс Удачного Игрока', icon: '🍀', price: 0.50, gifts: ['Малый бонус TON', 'Случайный стикер'], successChance: 0.9 },
    { id: 'case-6', name: 'Загадочный Кейс', icon: '❓', price: 2.00, gifts: ['Секретный подарок', 'Необычная НФТ'], successChance: 0.8 },
    { id: 'case-7', name: 'Премиум Кейс', icon: '🌟', price: 7.50, gifts: ['Эксклюзивный скин', 'Большой бонус TON'], successChance: 0.6 },
    { id: 'case-8', name: 'Богатый Кейс', icon: '💰', price: 12.00, gifts: ['Золотая монета', 'Редкое животное'], successChance: 0.4 },
    { id: 'case-9', name: 'Кейс Миллионера', icon: '👑', price: 25.00, gifts: ['Уникальная НФТ', 'Огромный бонус TON'], successChance: 0.05 },
];


document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cases-grid')) {
        renderCases();
        setupMultiOpen();
        document.getElementById('cases-grid').addEventListener('click', handleCaseClick);
        document.getElementById('open-multi-cases-button').addEventListener('click', handleMultiOpenClick);
    }
});

function renderCases() {
    const casesGrid = document.getElementById('cases-grid');
    const multiCaseSelect = document.getElementById('multi-case-select');

    casesGrid.innerHTML = ''; // Очищаем существующие кейсы
    multiCaseSelect.innerHTML = ''; // Очищаем опции мульти-открытия

    casesData.forEach(caseItem => {
        // Рендер карточек кейсов
        const card = document.createElement('div');
        card.className = 'case-card';
        card.innerHTML = 
            <div class="case-icon">${caseItem.icon}</div>
            <div class="case-name">${caseItem.name}</div>
            <div class="case-price">Открыть - ${caseItem.price.toFixed(2)} TON</div>
            <button class="button open-single-case" data-case-id="${caseItem.id}">Открыть</button>
        ;
        casesGrid.appendChild(card);

        // Рендер опций для мульти-открытия
        const option = document.createElement('option');
        option.value = caseItem.id;
        option.textContent = ${caseItem.name} (${caseItem.price.toFixed(2)} TON);
        multiCaseSelect.appendChild(option);
    });
}

async function handleCaseClick(event) {
    const button = event.target.closest('.open-single-case');
    if (button) {
        const caseId = button.dataset.caseId;
        await openCase(caseId, 1);
    }
}

async function handleMultiOpenClick() {
    const caseId = document.getElementById('multi-case-select').value;
    const count = parseInt(document.getElementById('open-count').value, 10);
    if (caseId && count > 0) {
        await openCase(caseId, count);
    }
}

async function openCase(caseId, count = 1) {
    const caseItem = casesData.find(c => c.id === caseId);
    if (!caseItem) {
        alert('Кейс не найден!');
        return;
    }

    const totalCost = caseItem.price * count;

    if (currentUser.balance < totalCost) {
        alert(Недостаточно TON! Нужно ${totalCost.toFixed(2)} TON.`);
        return;
    }
    // Здесь должна быть логика взаимодействия с Supabase для списания баланса и выдачи подарков
    // Для примера, уменьшим баланс на фронтенде и сгенерируем случайный подарок.
    // В реальном приложении:
    // 1. Запрос на бэкенд (Supabase Edge Function) для безопасного открытия кейса.
    // 2. Бэкенд списывает баланс, определяет подарок(и) (с учетом шансов), записывает в инвентарь пользователя.
    // 3. Бэкенд возвращает результат (список полученных подарков).

    try {
        // Шаг 1: Попытка обновить баланс пользователя
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', currentUser.id)
            .single();

        if (userError || userData.balance < totalCost) {
            alert('Ошибка баланса или недостаточно средств.');
            await updateBalanceDisplay(); // Обновим на всякий случай
            return;
        }

        const newBalance = userData.balance - totalCost;

        const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', currentUser.id)
            .select();

        if (updateError) {
            console.error('Ошибка при списании баланса:', updateError.message);
            alert('Ошибка при открытии кейса. Попробуйте снова.');
            return;
        }

        currentUser.balance = newBalance; // Обновляем локальный баланс
        updateBalanceDisplay(); // Обновляем отображение

        let receivedGifts = [];
        for (let i = 0; i < count; i++) {
            const gift = getRandomGift(caseItem.gifts);
            receivedGifts.push(gift);
            // Здесь должна быть логика добавления подарка в инвентарь пользователя в Supabase
            // Например:
            const { error: giftInsertError } = await supabase
                .from('user_gifts')
                .insert([{ user_id: currentUser.id, gift_name: gift, acquired_at: new Date().toISOString() }]);
            if (giftInsertError) {
                console.error('Ошибка при добавлении подарка в инвентарь:', giftInsertError.message);
            }
        }

        showResultModal(receivedGifts);

    } catch (error) {
        console.error('Неожиданная ошибка при открытии кейса:', error.message);
        alert('Произошла непредвиденная ошибка. Попробуйте позже.');
    }
}

function getRandomGift(giftsArray) {
    const randomIndex = Math.floor(Math.random() * giftsArray.length);
    return giftsArray[randomIndex];
}

function showResultModal(gifts) {
    const resultModal = document.getElementById('result-modal');
    const giftDisplay = document.getElementById('gift-display');

    if (gifts.length === 1) {
        giftDisplay.textContent = Вы получили: ${gifts[0]}!;
    } else {
        giftDisplay.innerHTML = Вы получили:<br>${gifts.map(g =>  - ${g}).join('<br>')};
    }

    resultModal.style.display = 'flex'; // Показываем модальное окно
    document.querySelector('.close-button').onclick = () => resultModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === resultModal) {
            resultModal.style.display = 'none';
        }
    };
}
