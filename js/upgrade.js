// upgrade.js — логика страницы апгрейдов

// Глобальная переменная для хранения данных пользователя
let userData = null;


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('upgrade.js: Инициализация страницы апгрейдов...');


    try {
        // Загружаем данные пользователя
        await loadUserData();

        // Инициализируем модальное окно пополнения
        initTopUpModal();
        // Инициализируем колесо апгрейда
        initUpgradeWheel();
    } catch (error) {
        console.error('upgrade.js: Ошибка при загрузке страницы:', error);
        showError('Ошибка загрузки данных. Попробуйте обновить страницу.');
    }
});

// Функция загрузки данных пользователя
async function loadUserData() {
    console.log('upgrade.js: Загрузка данных пользователя...');

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
        successChance: 0 // Шанс успеха апгрейда
    };

    // Загружаем баланс из Supabase
    await loadUserBalance();

    // Обновляем интерфейс
    updateUpgradeInterface(userData);
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
        console.warn('upgrade.js: Supabase client не инициализирован или нет ID пользователя');
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('balance_ton')
            .eq('telegram_id', userData.id)
            .single();

        if (error && error.code !== 'PGRST.55000') { // PGRST.55000 — запись не найдена
            console.error('upgrade.js: Ошибка загрузки баланса:', error);
            return;
        }

        if (data) {
            userData.balanceTon = parseFloat(data.balance_ton) || 0;
        } else {
            // Если пользователь не найден, создаём запись
            await createUserRecord();
        }
    } catch (error) {
        console.error('upgrade.js: Ошибка загрузки баланса:', error);
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
            console.error('upgrade.js: Ошибка создания записи пользователя:', error);
        } else {
            userData.balanceTon = 0;
        }
    } catch (error) {
        console.error('upgrade.js: Ошибка создания пользователя:', error);
    }
}

// Функция обновления интерфейса данными пользователя
function updateUpgradeInterface(userData) {
    // Заполняем данные пользователя
    const balanceElement = document.getElementById('userBalance');
    if (balanceElement) {
        balanceElement.textContent = `Balance: ${userData.balanceTon.toFixed(2)} TON`;
    }

    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = `@${userData.username}`;
    }

    const successChanceElement = document.getElementById('successChance');
    if (successChanceElement) {
        successChanceElement.textContent = `${userData.successChance}%`;
    }

    // Заполняем заголовок страницы
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && !pageTitle.textContent) {
        pageTitle.textContent = 'Upgrades';
    }

    // Заполняем тексты кнопок
    const addGiftText = document.getElementById('addGiftText');
    if (addGiftText) {
        addGiftText.textContent = 'Add Gift';
    }

    const chooseGiftText = document.getElementById('chooseGiftText');
    if (chooseGiftText) {
        chooseGiftText.textContent = 'Choose Gift';
    }

    const upgradeText = document.getElementById('upgradeText');
    if (upgradeText) {
        upgradeText.textContent = 'Upgrade!';
    }

    // Заполняем модальное окно
    updateTopUpModalContent();
}

// Функция инициализации колеса апгрейда
function initUpgradeWheel() {
    console.log('upgrade.js: Инициализация колеса апгрейда...');
    const wheel = document.getElementById('upgradeWheel');
    if (!wheel) {
        console.error('upgrade.js: Колесо апгрейда не найдено');
        return;
    }

    // Пример секторов колеса (можно подгружать из БД)
    const sectors = [
        { color: '#ff6b6b', label: 'Fail' },
        { color: '#4ecdc4', label: 'Success' },
        { color: '#45b7d1', label: 'Bonus' },
        { color: '#96ceb4', label: 'Retry' },
        { color: '#feca57', label: 'Jackpot' }
    ];

    renderUpgradeWheel(sectors, wheel);
}

// Функция отрисовки колеса апгрейда
function renderUpgradeWheel(sectors, container) {
    container.innerHTML = ''; // Очищаем контейнер


    const sectorAngle = 360 / sectors.length;

    sectors.forEach((sector, index) => {
        const sectorElement = document.createElement('div');
        sectorElement.className = 'wheel-sector';
        sectorElement.style.background = sector.color;
        sectorElement.style.transform = `rotate(${index * sectorAngle}deg)`;
        sectorElement.style.clipPath = `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((index + 1) * sectorAngle * Math.PI / 180)}% ${50 + 50 * Math.sin((index + 1) * sectorAngle * Math.PI / 180)}%)`;

        sectorElement.innerHTML = `<span style="transform: rotate(${sectorAngle / 2 + index * sectorAngle}deg)">${sector.label}</span>`;

        container.appendChild(sectorElement);
    });
}

// Функция запуска апгрейда (вращение колеса)
function startUpgrade() {
    console.log('upgrade.js: Запуск апгрейда...');

    if (!userData) {
        showError('Данные пользователя не загружены. Попробуйте обновить страницу.');
        return;
    }

    if (userData.balanceTon < 1) {
        showError('Недостаточно средств для апгрейда. Пополните баланс.');
        showTopUpModal();
        return;
    }

    // Анимация вращения колеса
    const wheel = document.getElementById('upgradeWheel');
    const randomSector = Math.floor(Math.random() * 5);
    const rotation = 1440 + (randomSector * 72); // 4 полных оборота + случайный сектор

    wheel.style.transition = 'transform 3s cubic-bezier(0.4, 0, 0.2, 1)';
    wheel.style.transform = `rotate(${rotation}deg)`;

    // После завершения анимации показываем результат
    setTimeout(() => {
        showUpgradeResult(randomSector);
    }, 3000);
}

// Функция показа результата апгрейда
function showUpgradeResult(sectorIndex) {
    const results = ['Неудача', 'Успех!', 'Бонус!', 'Повтор', 'Джекпот!'];
    alert(`Результат апгрейда: ${results[sectorIndex]}`);

    // Здесь можно добавить логику обновления баланса/инвентаря
}

// Инициализация мода
