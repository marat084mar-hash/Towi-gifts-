const db = window.supabase;
const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.dynamicContentContainer) {
        console.error("Dynamic content container not found. Is global.js loaded correctly?");
        return;
    }

    const inventoryContainer = window.dynamicContentContainer;
    await loadInventory(inventoryContainer);

    // Слушаем кастомное событие для обновления инвентаря
    document.addEventListener('inventoryUpdated', async () => {
        await loadInventory(inventoryContainer);
    });
});

async function loadInventory(container) {
    container.innerHTML = '<div class="loader"></div>'; // Показываем лоадер

    try {
        const userId = tg.initDataUnsafe?.user?.id;
        if (!userId) {
            container.innerHTML = <p class="hint-text" style="color: red;">Ошибка: ID пользователя не определен.</p>;
            return;
        }

        const { data: inventoryItems, error } = await db
            .from('inventory')
            .select('*, gifts(*)') // Выбираем все из инвентаря и джойним данные о подарках
            .eq('user_id', userId);

        if (error) {
            console.error('Ошибка при загрузке инвентаря:', error.message);
            container.innerHTML = <p class="hint-text" style="color: red;">Не удалось загрузить инвентарь: ${error.message}</p>;
            return;
        }

        container.innerHTML = ''; // Очищаем лоадер

        if (inventoryItems && inventoryItems.length > 0) {
            inventoryItems.forEach(item => {
                const gift = item.gifts; // Доступ к данным подарка
                if (!gift) return; // Пропускаем, если подарок не найден (например, был удален)
                                   const card = document.createElement('div');
                card.className = 'inventory-item-card case-card'; // Переиспользуем стили case-card
                card.innerHTML = 
                    <img src="${gift.image_url}" alt="${gift.name}">
                    <div class="item-name">${gift.name}</div>
                    <div class="item-price">${gift.price_ton} TON</div>
                    <div class="item-actions">
                        <button class="sell-button" onclick="sellGift('${item.id}', ${gift.price_ton})">Продать</button>
                        <button class="withdraw-button" onclick="withdrawGift('${item.id}')">Вывести</button>
                    </div>
                ;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = <p class="hint-text" id="emptyInventoryMessage">Инвентарь пуст. Откройте кейс или улучшите предмет, чтобы получить предметы!</p>;
        }
    } catch (e) {
        console.error('Непредвиденная ошибка при загрузке инвентаря:', e.message);
        container.innerHTML = <p class="hint-text" style="color: red;">Ошибка: ${e.message}</p>;
    }
}

// Глобальные функции для кнопок в инвентаре (доступны из HTML)
window.sellGift = async (inventoryItemId, price) => {
    tg.showConfirm(Вы уверены, что хотите продать этот предмет за ${parseFloat(price).toFixed(2)} TON?, async (confirmed) => {
        if (!confirmed) return;

        const userId = tg.initDataUnsafe?.user?.id;
        if (!userId) {
            tg.showAlert('Ошибка: ID пользователя не определен.');
            return;
        }

        try {
            // 1. Удалить предмет из инвентаря
            const { error: deleteError } = await db.from('inventory').delete().eq('id', inventoryItemId);
            if (deleteError) throw deleteError;

            // 2. Обновить баланс пользователя
            const { data: userProfile, error: profileError } = await db
                .from('profiles')
                .select('balance')
                .eq('id', userId)
                .single();

            if (profileError || !userProfile) throw profileError || new Error("Профиль пользователя не найден.");

            const newBalance = parseFloat(userProfile.balance) + parseFloat(price);
            const { error: updateError } = await db
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', userId);
            
            if (updateError) throw updateError;

            tg.showAlert(Предмет продан! Ваш баланс пополнен на ${parseFloat(price).toFixed(2)} TON.);
            // Обновляем отображение баланса и инвентаря
            document.dispatchEvent(new CustomEvent('balanceUpdated')); 
            document.dispatchEvent(new CustomEvent('inventoryUpdated')); 

        } catch (e) {
            console.error('Ошибка при продаже предмета:', e.message);
            tg.showAlert(Ошибка при продаже: ${e.message});
        }
    });
};

window.withdrawGift = (inventoryItemId) => {
    tg.showAlert(
        Для вывода предмета, пожалуйста, напишите на аккаунт: https://t.me/Tow1Gift_Storage.\n\nУкажите ID предмета для вывода: ${inventoryItemId}
    );
    // TODO: Здесь может быть дополнительная логика пометки предмета как "на выводе" в БД, 
    // чтобы предотвратить его повторную продажу или вывод.
};
