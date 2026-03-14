const db = window.supabase;
const tg = window.Telegram.WebApp;

let selectedSacrificedGift = null;
let selectedDesiredGift = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.dynamicContentContainer) {
        console.error("Dynamic content container not found. Is global.js loaded correctly?");
        return;
    }

    const upgradeContainer = window.dynamicContentContainer;
    await renderUpgradeUI(upgradeContainer);
    // Слушаем событие обновления инвентаря, чтобы обновить список предметов для апгрейда
    document.addEventListener('inventoryUpdated', async () => {
        await renderUpgradeUI(upgradeContainer);
    });
});

async function renderUpgradeUI(container) {
    container.innerHTML = '<div class="loader"></div>'; // Показываем лоадер

    try {
        const userId = tg.initDataUnsafe?.user?.id;
        if (!userId) {
            container.innerHTML = <p class="hint-text" style="color: red;">Ошибка: ID пользователя не определен.</p>;
            return;
        }

        // 1. Получаем инвентарь пользователя для выбора "жертвуемого" предмета
        const { data: userInventory, error: inventoryError } = await db
            .from('inventory')
            .select('*, gifts(*)')
            .eq('user_id', userId);

        if (inventoryError) {
            console.error('Ошибка при загрузке инвентаря для апгрейда:', inventoryError.message);
            container.innerHTML = <p class="hint-text" style="color: red;">Не удалось загрузить инвентарь: ${inventoryError.message}</p>;
            return;
        }

        // 2. Получаем все возможные подарки для выбора "желаемого" предмета
        const { data: allGifts, error: giftsError } = await db
            .from('gifts')
            .select('*')
            .order('price_ton', { ascending: true });

        if (giftsError) {
            console.error('Ошибка при загрузке всех подарков:', giftsError.message);
            container.innerHTML = <p class="hint-text" style="color: red;">Не удалось загрузить список подарков: ${giftsError.message}</p>;
            return;
        }

        container.innerHTML = 
            <div class="upgrade-interface">
                <div class="upgrade-slot-wrapper">
                    <div class="upgrade-slot" id="sacrificed-gift-slot">
                        <p>Подарок для улучшения (ваш)</p>
                    </div>
                    <button class="select-gift-btn" onclick="showSacrificedModal(${userId})">Выбрать подарок из инвентаря</button>
                </div>

                <div class="upgrade-center">
                    <div class="upgrade-chance" id="upgrade-chance">Шанс: 0%</div>
                    <button class="upgrade-button" id="start-upgrade-btn" onclick="startUpgrade()" disabled>Улучшить!</button>
                    <div class="upgrade-result" id="upgrade-result"></div>
                </div>

                <div class="upgrade-slot-wrapper">
                    <div class="upgrade-slot" id="desired-gift-slot">
                        <p>Желаемый подарок</p>
                    </div>
                    <button class="select-gift-btn" onclick="showDesiredModal()">Выбрать желаемый подарок</button>
                </div>
            </div>

            <!-- Модальное окно выбора жертвуемого предмета -->
            <div id="selectSacrificedModal" class="modal-overlay">
                <div class="modal-content">
                    <h2>Выберите предмет из инвентаря</h2>
                    <div id="sacrificed-gift-list" class="grid-container gift-selection-grid">
                        ${userInventory.length > 0 ? userInventory.map(item => 
                            <div class="selection-card case-card" onclick="setSacrificedGift('${item.id}', '${item.gifts.name}', '${item.gifts.image_url}', ${item.gifts.price_ton})">
                                <img src="${item.gifts.image_url}" alt="${item.gifts.name}">
                                <div class="item-name">${item.gifts.name}</div>
                                <div class="item-price">${item.gifts.price_ton} TON</div>
                            </div>
                        `).join('') : '<p class="hint-text">У вас нет предметов для улучшения.</p>'}
                    </div>
                    <button onclick="document.getElementById('selectSacrificedModal').style.display='none'">Закрыть</button>
                </div>
            </div>
            <!-- Модальное окно выбора желаемого предмета -->
            <div id="selectDesiredModal" class="modal-overlay">
                <div class="modal-content">
                    <h2>Выберите желаемый предмет</h2>
                    <div id="desired-gift-list" class="grid-container gift-selection-grid">
                        ${allGifts.length > 0 ? allGifts.map(gift => 
                            <div class="selection-card case-card" onclick="setDesiredGift('${gift.id}', '${gift.name}', '${gift.image_url}', ${gift.price_ton})">
                                <img src="${gift.image_url}" alt="${gift.name}">
                                <div class="item-name">${gift.name}</div>
                                <div class="item-price">${gift.price_ton} TON</div>
                            </div>
                        ).join('') : '<p class="hint-text">Нет доступных подарков для выбора.</p>'}
                    </div>
                    <button onclick="document.getElementById('selectDesiredModal').style.display='none'">Закрыть</button>
                </div>
            </div>
        ;

        // Восстанавливаем выбранные предметы, если они были
        if (selectedSacrificedGift) {
            document.getElementById('sacrificed-gift-slot').innerHTML = 
                <img src="${selectedSacrificedGift.imageUrl}" alt="${selectedSacrificedGift.name}">
                <p>${selectedSacrificedGift.name} (${selectedSacrificedGift.price} TON)</p>
            ;
        }
        if (selectedDesiredGift) {
            document.getElementById('desired-gift-slot').innerHTML = 
                <img src="${selectedDesiredGift.imageUrl}" alt="${selectedDesiredGift.name}">
                <p>${selectedDesiredGift.name} (${selectedDesiredGift.price} TON)</p>
            ;
        }
        updateUpgradeChance(); // Обновляем шанс после рендера

    } catch (e) {
        console.error('Непредвиденная ошибка при загрузке страницы апгрейда:', e.message);
        container.innerHTML = <p class="hint-text" style="color: red;">Ошибка: ${e.message}</p>;
    }
}


// Глобальные функции для логики апгрейда
window.showSacrificedModal = (userId) => {
    document.getElementById('selectSacrificedModal').style.display = 'flex';
};

window.showDesiredModal = () => {
    document.getElementById('selectDesiredModal').style.display = 'flex';
};

window.setSacrificedGift = (id, name, imageUrl, price) => {
    selectedSacrificedGift = { id, name, imageUrl, price };
    document.getElementById('sacrificed-gift-slot').innerHTML = 
        <img src="${imageUrl}" alt="${name}">
        <p>${name} (${price} TON)</p>
    ;
    document.getElementById('selectSacrificedModal').style.display = 'none';
    updateUpgradeChance();
};

window.setDesiredGift = (id, name, imageUrl, price) => {
    selectedDesiredGift = { id, name, imageUrl, price };
    document.getElementById('desired-gift-slot').innerHTML = 
        <img src="${imageUrl}" alt="${name}">
        <p>${name} (${price} TON)</p>
    ;
    document.getElementById('selectDesiredModal').style.display = 'none';
    updateUpgradeChance();
};

function updateUpgradeChance() {
    const chanceElement = document.getElementById('upgrade-chance');
    const upgradeButton = document.getElementById('start-upgrade-btn');

    if (selectedSacrificedGift && selectedDesiredGift) {
        const sacrificedPrice = selectedSacrificedGift.price;
        const desiredPrice = selectedDesiredGift.price;

        let chance = (sacrificedPrice / desiredPrice) * 100;
        chance = Math.max(10, Math.min(95, chance)); // Шанс от 10% до 95%
        
        chanceElement.textContent = Шанс: ${chance.toFixed(0)}%`;
        upgradeButton.disabled = false;
        upgradeButton.onclick = window.startUpgrade; // Привязываем функцию только когда кнопка активна

    } else {
        chanceElement.textContent = 'Шанс: 0%';
        upgradeButton.disabled = true;
        upgradeButton.onclick = null;
    }
}
    window.startUpgrade = async () => {
    if (!selectedSacrificedGift || !selectedDesiredGift) {
        tg.showAlert('Пожалуйста, выберите оба предмета для улучшения.');
        return;
    }

    const userId = tg.initDataUnsafe?.user?.id;
    if (!userId) {
        tg.showAlert('Ошибка: ID пользователя не определен.');
        return;
    }

    tg.showConfirm('Вы уверены, что хотите начать улучшение? Жертвуемый предмет может быть потерян!', async (confirmed) => {
        if (!confirmed) return;

        // Пересчет шанса
        const sacrificedPrice = selectedSacrificedGift.price;
        const desiredPrice = selectedDesiredGift.price;
        let chance = (sacrificedPrice / desiredPrice) * 100;
        chance = Math.max(10, Math.min(95, chance));

        const success = Math.random() * 100 < chance;
        const resultDisplay = document.getElementById('upgrade-result');
        const upgradeButton = document.getElementById('start-upgrade-btn');
        
        // --- Анимация процесса улучшения ---
        resultDisplay.textContent = 'Улучшение...';
        resultDisplay.style.color = 'var(--text-hint)';
        upgradeButton.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 2500)); // Задержка для анимации

        try {
            // 1. Удаляем жертвуемый предмет из инвентаря
            const { error: deleteError } = await db.from('inventory').delete().eq('id', selectedSacrificedGift.id);
            if (deleteError) throw deleteError;

            if (success) {
                resultDisplay.textContent = Успех! Вы получили ${selectedDesiredGift.name}!;
                resultDisplay.style.color = 'var(--success-green)';
                tg.showAlert(Поздравляем! Вы успешно улучшили предмет до ${selectedDesiredGift.name}!);

                // Добавляем новый предмет в инвентарь
                const { error: insertError } = await db.from('inventory').insert({
                    user_id: userId,
                    gift_id: selectedDesiredGift.id,
                    added_at: new Date().toISOString()
                });
                if (insertError) throw insertError;

            } else {
                resultDisplay.textContent = Неудача... Вы потеряли ${selectedSacrificedGift.name}.;
                resultDisplay.style.color = 'var(--danger-red)'; // Красный
                tg.showAlert(Неудача... Вы потеряли ${selectedSacrificedGift.name}.);
                // Предмет уже удален
            }

            // Сбрасываем выбранные предметы
            selectedSacrificedGift = null;
            selectedDesiredGift = null;
            
            // Обновляем инвентарь и UI апгрейда
            document.dispatchEvent(new CustomEvent('balanceUpdated')); 
            document.dispatchEvent(new CustomEvent('inventoryUpdated')); 
            await renderUpgradeUI(window.dynamicContentContainer); // Перерендерим UI апгрейда
            
        } catch (e) {
            console.error('Ошибка в процессе улучшения:', e.message);
            resultDisplay.textContent = Критическая ошибка: ${e.message};
            resultDisplay.style.color = 'var(--danger-red)';
            tg.showAlert(Критическая ошибка: ${e.message});
        } finally {
            upgradeButton.disabled = false;
        }
    });
};
