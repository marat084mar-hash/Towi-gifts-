let selectedGiftForUpgrade = null;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('upgrade-html-loaded')) { // Проверка, что скрипт загружен на нужной странице
        loadUserGifts();
        document.getElementById('perform-upgrade-button').addEventListener('click', performUpgrade);
    }
});

// Функция для загрузки подарков пользователя из Supabase
async function loadUserGifts() {
    const userGiftsList = document.getElementById('user-gifts-list');
    userGiftsList.innerHTML = '';

    if (!currentUser.id) {
        userGiftsList.innerHTML = '<p>Пожалуйста, войдите, чтобы увидеть свои подарки.</p>';
        return;
    }
    const { data: gifts, error } = await supabase
        .from('user_gifts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('acquired_at', { ascending: false });

    if (error) {
        console.error('Ошибка при загрузке подарков пользователя:', error.message);
        userGiftsList.innerHTML = '<p>Ошибка при загрузке подарков.</p>';
        return;
    }

    if (gifts.length === 0) {
        userGiftsList.innerHTML = '<p>У вас пока нет подарков для апгрейда.</p>';
        return;
    }

    gifts.forEach(gift => {
        const giftItem = document.createElement('div');
        giftItem.className = 'gift-item';
        giftItem.innerHTML = 
            <span>${gift.gift_name} (ID: ${gift.id.substring(0, 4)})</span>
            <button class="button select-gift-for-upgrade" data-gift-id="${gift.id}" data-gift-name="${gift.gift_name}">Выбрать</button>
        ;
        userGiftsList.appendChild(giftItem);
    });

    document.querySelectorAll('.select-gift-for-upgrade').forEach(button => {
        button.addEventListener('click', (event) => {
            selectedGiftForUpgrade = {
                id: event.target.dataset.giftId,
                name: event.target.dataset.giftName
            };
            updateSelectedGiftDisplay();
        });
    });
}

function updateSelectedGiftDisplay() {
    const selectedGiftInfo = document.getElementById('selected-gift-info');
    const performUpgradeButton = document.getElementById('perform-upgrade-button');
    const successChanceDisplay = document.getElementById('success-chance');

    if (selectedGiftForUpgrade) {
        selectedGiftInfo.innerHTML = <p>Выбран: <strong>${selectedGiftForUpgrade.name}</strong></p>;
        // Шанс успеха может зависеть от редкости подарка или других факторов
        const baseChance = 75; // Пример
        successChanceDisplay.textContent = ${baseChance}%;
        performUpgradeButton.disabled = false;
    } else {
        selectedGiftInfo.innerHTML = '<p>Пока не выбрано.</p>';
        successChanceDisplay.textContent = '0%';
        performUpgradeButton.disabled = true;
    }
}

async function performUpgrade() {
    if (!selectedGiftForUpgrade) {
        alert('Пожалуйста, выберите подарок для апгрейда.');
        return;
    }

    if (!confirm(Вы уверены, что хотите апгрейдить "${selectedGiftForUpgrade.name}"? Есть шанс потерять его!)) {
        return;
    }

    // Логика апгрейда: взаимодействие с Supabase
    // В реальном приложении:
    // 1. Запрос на бэкенд (Supabase Edge Function) для безопасного выполнения апгрейда.
    // 2. Бэкенд определяет результат (успех/неудача, новый подарок, потеря) на основе шансов.
    // 3. Бэкенд обновляет инвентарь пользователя (удаляет старый, добавляет новый или ничего).
    // 4. Бэкенд возвращает результат.

    const baseChance = 75; // Используем базовый шанс из функции updateSelectedGiftDisplay
    const isSuccess = Math.random() * 100 < baseChance;

    if (isSuccess) {
        // Успешный апгрейд
        const upgradedGiftName = Улучшенный ${selectedGiftForUpgrade.name};
        // Удаляем старый подарок и добавляем новый
        const { error: deleteError } = await supabase
            .from('user_gifts')
            .delete()
            .eq('id', selectedGiftForUpgrade.id);

        if (deleteError) {
            console.error('Ошибка при удалении старого подарка:', deleteError.message);
            alert('Ошибка апгрейда. Попробуйте снова.');
            return;
        }

        const { error: insertError } = await supabase
            .from('user_gifts')
            .insert([{ user_id: currentUser.id, gift_name: upgradedGiftName, acquired_at: new Date().toISOString() }]);

        if (insertError) {
            console.error('Ошибка при добавлении улучшенного подарка:', insertError.message);
            alert('Ошибка апгрейда. Попробуйте снова.');
            return;
        }

         alert(Поздравляем! Ваш подарок "${selectedGiftForUpgrade.name}" успешно улучшен до "${upgradedGiftName}"!);
        alert(Поздравляем! Ваш подарок "${selectedGiftForUpgrade.name}" успешно улучшен до "${upgradedGiftName}"!);
        } else {
        // Неудачный апгрейд - подарок потерян
        const { error: deleteError } = await supabase
            .from('user_gifts')
            .delete()
            .eq('id', selectedGiftForUpgrade.id);

        if (deleteError) {
            console.error('Ошибка при удалении потерянного подарка:', deleteError.message);
            alert('Ошибка апгрейда. Попробуйте снова.');
            return;
        }

        alert(К сожалению, апгрейд не удался. Вы потеряли "${selectedGiftForUpgrade.name}".);
    }

    selectedGiftForUpgrade = null; // Сброс выбранного подарка
    await loadUserGifts(); // Перезагрузка списка подарков
    updateSelectedGiftDisplay(); // Обновление UI
}
