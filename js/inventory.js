// inventory.js — логика страницы инвентаря


// Глобальная переменная для хранения данных пользователя
let userData = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('inventory.js: Инициализация страницы инвентаря...');

    try {
        // Загружаем данные пользователя
        await loadUserData();

        // Инициализируем модальное окно пополнения
        initTopUpModal();

        // Загружаем инвентарь
        await loadInventory();
    } catch (error) {
        console.error('inventory.js: Ошибка при загрузке страницы:', error);
        showError('Ошибка загрузки данных. Попробуйте обновить страницу.');
    }
});

// Функция загрузки данных пользователя
async function loadUserData() {
    console.log('inventory.js: Загрузка данных пользователя...');

    // Получаем данные из Telegram Web App
    const tg = window.Telegram.WebApp;
    tg.ready();

    // Создаём объект с данными пользователя
    userData = {
        id: tg.initDataUnsafe?.user?.id || 'unknown',
        username: tg.initDataUnsafe?.user?.username || `user${tg.initDataUnsafe?.user?.id}`,
        firstName: tg.initDataUnsafe?.user?.first_name || 'Пользователь',
        avatarUrl: getAvatarUrl(tg.initDataUnsafe?.user),
        balanceTon: 0, // Будет обновлено из Supabase
        cooldownMessage: 'КД 21 день на вывод подарков! Telegram Stars'
    };

    // Загружаем баланс из Supabase
    await loadUserBalance();

    // Обновляем интерфейс
    updateUserInterface(userData);
}

// Функция получения URL аватара
function getAvatarUrl(telegramUser) {
    if (telegramUser?.photo_url) {
        return telegramUser.photo_url;
    }
    // Если нет аватара, используем дефолтный
    return 'images/default-avatar.png';
}

// Функция загрузки баланса пользователя из Supabase
async function loadUserBalance() {
    if (!window.supabaseClient || !userData?.id) {
        console.warn('inventory.js: Supabase client не инициализирован или нет ID пользователя');
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('balance_ton')
            .eq('telegram_id', userData.id)
            .single();

        if (error && error.code !== 'PGRST.55000') { // PGRST.55000 — запись не найдена
            console.error('inventory.js: Ошибка загрузки баланса:', error);
            return;
        }

        if (data) {
            userData.balanceTon = parseFloat(data.balance_ton) || 0;
        } else {
            // Если пользователь не найден, создаём запись
            await createUserRecord();
        }
    } catch (error) {
        console.error('inventory.js: Ошибка загрузки баланса:', error);
    }
}

// Функция создания записи пользователя в базе данных
async function createUserRecord() {
    try {
        const { error } = await window.supabaseClient
            .from('users')
            .insert([{
                telegram_id: userData.id,
                username: userData.username,
                first_name: userData.firstName,
                balance_ton: 0
            }]);

        if (error) {
            console.error('inventory.js: Ошибка создания записи пользователя:', error);
        } else {
            userData.balanceTon = 0;
        }
    } catch (error) {
        console.error('inventory.js: Ошибка создания пользователя:', error);
    }
}

// Функция обновления интерфейса данными пользователя
function updateUserInterface(userData) {
    // Заполняем данные пользователя
    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) {
        avatarElement.src = userData.avatarUrl;
        avatarElement.alt = `Аватар ${userData.firstName}`;
    }

    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = `@${userData.username}`;
    }

    const balanceElement = document.getElementById('userBalance');
    if (balanceElement) {
        balanceElement.textContent = `Balance: ${userData.balanceTon.toFixed(2)} TON`;
    }

    const cooldownElement = document.getElementById('cooldownMessage');
    if (cooldownElement) {
        cooldownElement.innerHTML = `<i class="fas fa-hourglass-half"></i> ${userData.cooldownMessage}`;
    }

    // Заполняем заголовок страницы
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && !pageTitle.textContent) {
        pageTitle.textContent = 'Inventory';
    }

    // Заполняем модальное окно (если открыто)
    updateTopUpModalContent();
}

// Функция загрузки инвентаря
async function loadInventory() {
    console.log('inventory.js: Загрузка инвентаря...');
    const inventoryGrid = document.getElementById('inventory-items-grid');
    const emptyMessage = document.getElementById('emptyInventoryMessage');

    if (!inventoryGrid) {
        console.error('inventory.js: Контейнер инвентаря не найден');
        return;
    }

    // Показываем загрузку
    inventoryGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Loading inventory...</p>';

    try {
        if (!window.supabaseClient || !userData?.id) {
            throw new Error('Supabase client не инициализирован');
        }

        const { data: inventoryItems, error } = await window.supabaseClient
            .from('inventory')
            .select(`
                *,
                items (name, rarity, image_url)
            `)
            .eq('owner_id', userData.id);

        if (error) {
            throw error;
        }

        if (!inventoryItems || inventoryItems.length === 0) {
            // Инвентарь пуст
            if (emptyMessage) {
                emptyMessage.textContent = 'Your inventory is empty.';
                inventoryGrid.innerHTML = '';
                inventoryGrid.appendChild(emptyMessage);
            }
            return;
        }

        // Отображаем предметы инвентаря
        renderInventoryItems(inventoryItems, inventoryGrid);

    } catch (error) {
        console.error('inventory.js: Ошибка загрузки инвентаря:', error);
        showError('Ошибка загрузки инвентаря. Попробуйте позже.');
    }
}

// Функция отображения предметов инвентаря
function renderInventoryItems(items, container) {
    container.innerHTML = ''; // Очищаем контейнер

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item-card';

        const itemData = item.items || {};
        itemElement.innerHTML = `
            <div class="item-image-container">
                <img src="${itemData.image_url || 'images/item-placeholder.png'}"
                     alt="${itemData.name || 'Предмет'}"
             class="item-image">
            </div>
            <div class="item-info">
                <h3 class="item-name">${itemData.name || 'Неизвестный предмет'}</h3>
                <span class="item-rarity rarity-${itemData.rarity || 'common'}">
                    ${itemData.rarity || 'common'}
                </span>
            </div>
        `;

        container.appendChild(itemElement);
    });
}

// Инициализация модального окна пополнения
function initTopUpModal() {
    const closeBtn = document.querySelector('#topUpModal .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTopUpModal);
    }

    // Закрытие по клику вне модального окна
    document.getElementById('topUpModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeTopUpModal();
        }
    });
}

// Функция открытия модального окна пополнения
function showTopUpModal() {
    document.getElementById('topUpModal').style.display = 'block';
    updateTopUpModalContent();
}

// Функция закрытия модального окна пополнения
function closeTopUpModal() {
    document.getElementById('topUpModal').style.display = 'none';
}

// Обновление содержимого модального окна
function updateTop
